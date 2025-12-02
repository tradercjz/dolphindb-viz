
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { DATA_INPUTS, TM_INPUTS, PIVOT_DATA, TS_ENGINE_DATA, RSE_DATA, CSE_DATA, ASOF_Y, AGGR_TOPN_DATA, ACCUMULATE_DATA, EACH_DATA_X, EACH_DATA_Y, EACH_PRE_X, DEFAULTS, FuncType, AppMode, AccFunc, PairFunc, GroupFunc, SegmentFunc } from './constants';
import { useConditionalIterateLogic } from './hooks/useConditionalIterate';
import { useTmSeriesLogic } from './hooks/useTmSeriesLogic';
import { usePivotLogic } from './hooks/usePivotLogic';
import { useTimeSeriesEngineLogic } from './hooks/useTimeSeriesEngineLogic';
import { useReactiveStateEngineLogic } from './hooks/useReactiveStateEngineLogic';
import { useCrossSectionalEngineLogic } from './hooks/useCrossSectionalEngineLogic';
import { useAsofLogic } from './hooks/useAsofLogic';
import { useAggrTopNLogic, AggrFunc } from './hooks/useAggrTopNLogic';
import { useAccumulateLogic } from './hooks/useAccumulateLogic';
import { useEachLogic } from './hooks/useEachLogic';
import { useEachPairLogic } from './hooks/useEachPairLogic';
import { useGroupingLogic } from './hooks/useGroupingLogic';
import { useSegmentbyLogic } from './hooks/useSegmentbyLogic';
import { useRollingLogic } from './hooks/useRollingLogic';

export default function App() {
  // --- Global App State ---
  const [mode, setMode] = useState<AppMode>('conditionalIterate');
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- Logic Parameter State (Shared or Mode Specific) ---
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [funcType, setFuncType] = useState<FuncType>(DEFAULTS.funcType);
  const [funcWindow, setFuncWindow] = useState(DEFAULTS.funcWindow);
  
  // Pivot Specific
  const [pivotFunc, setPivotFunc] = useState<'last'|'sum'|'count'>('last');

  // TS Engine Specific
  const [tsWindowSize, setTsWindowSize] = useState(DEFAULTS.tsWindowSize);
  const [tsStep, setTsStep] = useState(DEFAULTS.tsStep);

  // RSE Specific
  const [rseWindow, setRseWindow] = useState(DEFAULTS.rseWindow);

  // AggrTopN Specific
  const [aggrTopNFunc, setAggrTopNFunc] = useState<AggrFunc>('sum');
  const [aggrTopNTop, setAggrTopNTop] = useState(3);
  const [aggrTopNAsc, setAggrTopNAsc] = useState(true);

  // Accumulate Specific
  const [accFunc, setAccFunc] = useState<AccFunc>('sum');

  // Each Pair Specific
  const [pairFunc, setPairFunc] = useState<PairFunc>('sub');
  const [pairBoundary, setPairBoundary] = useState(0);

  // Grouping Specific
  const [groupFunc, setGroupFunc] = useState<GroupFunc>('sum');

  // Segmentby Specific
  const [segmentFunc, setSegmentFunc] = useState<SegmentFunc>('cumsum');

  // Rolling Specific
  const [rollingWindow, setRollingWindow] = useState(10);
  const [rollingStep, setRollingStep] = useState(5);

  // --- Calculations ---
  // 1. Conditional Iterate Logic
  const condIterResults = useConditionalIterateLogic(threshold, funcType, funcWindow);

  // 2. TM Series Logic (Standalone)
  const tmSeriesResults = useTmSeriesLogic(funcWindow);
  
  // 3. Pivot Logic
  const pivotResults = usePivotLogic(pivotFunc);

  // 4. TS Engine Logic
  const tsEngineResults = useTimeSeriesEngineLogic(tsWindowSize, tsStep);

  // 5. RSE Logic
  const rseResults = useReactiveStateEngineLogic(rseWindow);

  // 6. CSE Logic
  const cseResults = useCrossSectionalEngineLogic();

  // 7. Asof Logic
  const asofResults = useAsofLogic();

  // 8. AggrTopN Logic
  const aggrTopNResults = useAggrTopNLogic(aggrTopNFunc, aggrTopNTop, aggrTopNAsc);

  // 9. Accumulate Logic
  const accumulateResults = useAccumulateLogic(accFunc);

  // 10. Each Logic
  const eachLeftResults = useEachLogic('left');
  const eachRightResults = useEachLogic('right');

  // 11. Each Pair Logic
  const eachPreResults = useEachPairLogic('pre', pairFunc, pairBoundary);
  const eachPostResults = useEachPairLogic('post', pairFunc, pairBoundary);

  // 12. Grouping Logic
  const groupingResults = useGroupingLogic(
      mode === 'contextby' ? 'contextby' : 'groupby',
      groupFunc
  );

  // 13. Segmentby Logic
  const segmentbyResults = useSegmentbyLogic(segmentFunc);

  // 14. Rolling Logic
  const rollingResults = useRollingLogic(rollingWindow, rollingStep);

  // Determine which results to use based on mode
  let currentResults: any[] = [];
  let totalSteps = DATA_INPUTS.length; // Default

  if (mode === 'conditionalIterate') {
      currentResults = condIterResults;
      totalSteps = DATA_INPUTS.length;
  } else if (mode === 'tmFunction') {
      currentResults = tmSeriesResults;
      totalSteps = TM_INPUTS.length;
  } else if (mode === 'pivot') {
      currentResults = pivotResults.steps;
      totalSteps = PIVOT_DATA.length;
  } else if (mode === 'createTimeSeriesEngine') {
      currentResults = tsEngineResults;
      totalSteps = TS_ENGINE_DATA.length;
  } else if (mode === 'createReactiveStateEngine') {
      currentResults = rseResults;
      totalSteps = RSE_DATA.length;
  } else if (mode === 'createCrossSectionalEngine') {
      currentResults = cseResults;
      totalSteps = CSE_DATA.length;
  } else if (mode === 'asof') {
      currentResults = asofResults;
      totalSteps = ASOF_Y.length;
  } else if (mode === 'aggrTopN') {
      currentResults = []; 
      totalSteps = 4;
  } else if (mode === 'accumulate') {
      currentResults = accumulateResults;
      totalSteps = ACCUMULATE_DATA.length;
  } else if (mode === 'eachLeft') {
      currentResults = eachLeftResults;
      totalSteps = EACH_DATA_X.length;
  } else if (mode === 'eachRight') {
      currentResults = eachRightResults;
      totalSteps = EACH_DATA_Y.length;
  } else if (mode === 'eachPre') {
      currentResults = eachPreResults;
      totalSteps = EACH_PRE_X.length;
  } else if (mode === 'eachPost') {
      currentResults = eachPostResults;
      totalSteps = EACH_PRE_X.length;
  } else if (mode === 'groupby' || mode === 'contextby') {
      currentResults = groupingResults.items;
      totalSteps = 4; 
  } else if (mode === 'segmentby') {
      currentResults = [];
      totalSteps = 4;
  } else if (mode === 'rolling') {
      currentResults = rollingResults;
      totalSteps = rollingResults.length;
  } else {
      currentResults = condIterResults;
  }

  // Reset progress if mode changes
  useEffect(() => {
      setProgress(0);
      setIsPlaying(false);
  }, [mode]);

  // --- Animation Loop ---
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Adjust speed based on mode
      let speed = 1.5;
      if (mode === 'asof' || mode === 'accumulate' || mode === 'eachLeft' || mode === 'eachRight' || mode === 'eachPre' || mode === 'eachPost') speed = 0.5;
      if (mode === 'aggrTopN' || mode === 'groupby' || mode === 'contextby' || mode === 'segmentby' || mode === 'rolling') speed = 0.8;

      setProgress((prev) => {
        const newProgress = prev + (delta * speed); 
        if (newProgress >= totalSteps) {
            setIsPlaying(false);
            return totalSteps;
        }
        return newProgress;
      });
      
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      if (progress >= totalSteps) setProgress(0);
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, totalSteps, mode]);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden font-mono">
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [5, 5, 14], fov: 45 }}
          gl={{ antialias: false, toneMappingExposure: 1.5 }}
        >
          <Scene 
            mode={mode}
            progress={progress} 
            results={currentResults}
            pivotLogic={pivotResults}
            tsEngineLogic={tsEngineResults}
            rseLogic={rseResults}
            cseLogic={cseResults}
            asofLogic={asofResults}
            aggrTopNLogic={aggrTopNResults}
            accumulateLogic={accumulateResults}
            eachLogic={mode === 'eachLeft' ? eachLeftResults : eachRightResults}
            eachPairLogic={mode === 'eachPre' ? eachPreResults : eachPostResults}
            groupingLogic={groupingResults}
            segmentbyLogic={segmentbyResults}
            rollingLogic={rollingResults}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            funcWindow={funcWindow}
            funcType={funcType}
            tsWindowSize={tsWindowSize}
          />
        </Canvas>
      </div>

      <UIOverlay 
        mode={mode}
        setMode={setMode}
        progress={progress} 
        setProgress={setProgress}
        totalSteps={totalSteps}
        hoveredIndex={hoveredIndex}
        results={currentResults}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        params={{
          threshold, setThreshold,
          funcType, setFuncType,
          funcWindow, setFuncWindow,
          pivotFunc, setPivotFunc,
          tsWindowSize, setTsWindowSize,
          tsStep, setTsStep,
          rseWindow, setRseWindow,
          aggrTopNFunc, setAggrTopNFunc,
          aggrTopNTop, setAggrTopNTop,
          aggrTopNAsc, setAggrTopNAsc,
          accFunc, setAccFunc,
          pairFunc, setPairFunc,
          pairBoundary, setPairBoundary,
          groupFunc, setGroupFunc,
          segmentFunc, setSegmentFunc,
          rollingWindow, setRollingWindow,
          rollingStep, setRollingStep
        }}
      />
    </div>
  );
}
