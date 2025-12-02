import React, { useState } from 'react';
import { Plugin } from '../types/plugin';
import { AsofStage } from '../components/AsofStage';
import { useAsofLogic } from '../hooks/useAsofLogic';

const AsofScene: React.FC<{ isPlaying: boolean; progress: number; params: any }> = ({ isPlaying, progress, params }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const logic = useAsofLogic();

  return (
    <AsofStage
      progress={progress}
      logic={logic}
      hoveredIndex={hoveredIndex}
      setHoveredIndex={setHoveredIndex}
    />
  );
};

export const AsofPlugin: Plugin = {
  id: 'asof',
  name: 'AsOf Join',
  description: 'Visualize asof join operation',
  SceneComponent: AsofScene,
  defaultParams: {}
};
