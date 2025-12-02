import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { registerPlugins } from './plugins';
import { usePluginRegistry } from './hooks/usePluginRegistry';
import { PluginSidebar } from './components/PluginSidebar';
import { OrbitControls } from '@react-three/drei';

// Initialize plugins
registerPlugins();

export default function AppPlugin() {
  const plugins = usePluginRegistry();
  const [activePluginId, setActivePluginId] = useState<string>('accumulate');
  const [params, setParams] = useState<any>({});
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxSteps, setMaxSteps] = useState(10);

  const activePlugin = plugins.find(p => p.id === activePluginId);

  // Reset params when plugin changes
  useEffect(() => {
    if (activePlugin) {
      setParams(activePlugin.defaultParams || {});
      setProgress(0);
      setIsPlaying(false);
      setMaxSteps(10); // Default reset
    }
  }, [activePluginId]);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setProgress((prev) => {
          const newProgress = prev + delta * 1.5;
          if (newProgress > maxSteps) {
             setIsPlaying(false);
             return maxSteps;
          }
          return newProgress;
        });
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, maxSteps]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (!isPlaying && progress >= maxSteps) {
          setProgress(0);
        }
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, progress, maxSteps]);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-mono flex">
      {/* Sidebar */}
      <PluginSidebar 
        plugins={plugins} 
        activePluginId={activePluginId} 
        onSelectPlugin={setActivePluginId} 
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-64">
        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 10], fov: 45 }}
            gl={{ antialias: false, toneMappingExposure: 1.5 }}
          >
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls makeDefault />
            
            {activePlugin && (
              <activePlugin.SceneComponent 
                isPlaying={isPlaying} 
                progress={progress} 
                params={params} 
                onStepsReady={setMaxSteps}
              />
            )}
          </Canvas>
        </div>

        {/* UI Overlay (Controls) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
          {/* Playback Controls */}
          <div className="bg-gray-900 p-2 rounded border border-gray-700 text-white w-64">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (!isPlaying && progress >= maxSteps) {
                      setProgress(0);
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  className="px-3 py-1 bg-cyan-600 rounded hover:bg-cyan-500 font-bold text-xs"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button 
                  onClick={() => { setProgress(0); setIsPlaying(false); }}
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-xs"
                >
                  Reset
                </button>
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                {progress.toFixed(1)} / {maxSteps}
              </div>
            </div>
          </div>

          {/* Plugin Specific Controls */}
          {activePlugin && activePlugin.ParameterPanelComponent && (
            <div className="bg-gray-900 border border-gray-700 rounded overflow-hidden w-64 max-h-[60vh] flex flex-col">
              <div className="bg-gray-800 p-2 font-bold text-gray-300 text-sm border-b border-gray-700 shrink-0">
                Parameters
              </div>
              <div className="overflow-y-auto p-2">
                <activePlugin.ParameterPanelComponent 
                  params={params} 
                  setParams={setParams} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
