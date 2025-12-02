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

  const activePlugin = plugins.find(p => p.id === activePluginId);

  // Reset params when plugin changes
  useEffect(() => {
    if (activePlugin) {
      setParams(activePlugin.defaultParams || {});
      setProgress(0);
      setIsPlaying(false);
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
          // Assuming a default duration or max steps. 
          // Ideally, the plugin should tell us the max steps.
          // For now, let's assume 10 steps or loop.
          // In the original App, totalSteps was derived from data length.
          // We might need to expose `totalSteps` from the plugin logic or scene.
          // For this refactor, let's just increment indefinitely or loop at 10.
          const newProgress = prev + delta * 1.5;
          if (newProgress > 10) {
             setIsPlaying(false);
             return 0;
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
  }, [isPlaying]);

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
              />
            )}
          </Canvas>
        </div>

        {/* UI Overlay (Controls) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
          {/* Playback Controls */}
          <div className="bg-gray-900 p-4 rounded border border-gray-700 text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500 font-bold"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button 
                onClick={() => { setProgress(0); setIsPlaying(false); }}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="text-sm font-mono">
                Progress: {progress.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Plugin Specific Controls */}
          {activePlugin && activePlugin.ParameterPanelComponent && (
            <div className="bg-gray-900 border border-gray-700 rounded overflow-hidden">
              <div className="bg-gray-800 p-2 font-bold text-gray-300 text-sm border-b border-gray-700">
                Parameters
              </div>
              <activePlugin.ParameterPanelComponent 
                params={params} 
                setParams={setParams} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
