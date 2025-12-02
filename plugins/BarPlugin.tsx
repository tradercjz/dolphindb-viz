import React from 'react';
import { Plugin } from '../types/plugin';
import { BarStage } from '../components/BarStage';
import { useBarLogic } from '../hooks/useBarLogic';

const BarScene: React.FC<{
  isPlaying: boolean;
  progress: number;
  params: any;
  onStepsReady?: (steps: number) => void;
}> = ({ progress, params, onStepsReady }) => {
  const logic = useBarLogic(params.interval, params.closed);

  React.useEffect(() => {
    if (onStepsReady) {
      onStepsReady(4);
    }
  }, [onStepsReady]);

  return <BarStage progress={progress} logic={logic} />;
};

const BarParams: React.FC<{
  params: any;
  setParams: (params: any) => void;
}> = ({ params, setParams }) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Interval</label>
        <input
          type="number"
          min="1"
          max="10"
          value={params.interval}
          onChange={(e) => setParams({ ...params, interval: Number(e.target.value) })}
          className="w-full bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Closed</label>
        <select
          value={params.closed}
          onChange={(e) => setParams({ ...params, closed: e.target.value })}
          className="w-full bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-sm"
        >
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        <p>Calculates grouping key based on interval.</p>
        <p className="mt-1">
          {params.closed === 'left' 
            ? "Left: X - (X % interval)" 
            : "Right: Snaps to right boundary"}
        </p>
      </div>
    </div>
  );
};

export const BarPlugin: Plugin = {
  id: 'bar',
  name: 'bar',
  description: 'Group data into intervals (buckets).',
  SceneComponent: BarScene,
  ParameterPanelComponent: BarParams,
  defaultParams: {
    interval: 3,
    closed: 'left'
  }
};
