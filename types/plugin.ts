import { ReactNode } from 'react';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  
  /**
   * The 3D Scene component to be rendered inside the Canvas.
   * It should handle its own logic (hooks) or accept props if managed externally.
   * In this architecture, it's recommended to handle logic internally or via a wrapper.
   */
  SceneComponent: React.ComponentType<{
    isPlaying: boolean;
    progress: number;
    params: any;
  }>;

  /**
   * The Parameter Panel component to be rendered in the UI Overlay.
   */
  ParameterPanelComponent?: React.ComponentType<{
    params: any;
    setParams: (params: any) => void;
  }>;

  /**
   * Default parameters for the plugin
   */
  defaultParams?: Record<string, any>;
}
