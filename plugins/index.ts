import { registry as PluginRegistry } from '../lib/PluginRegistry';
import { AccumulatePlugin } from './AccumulatePlugin';
import { ConditionalIteratePlugin } from './ConditionalIteratePlugin';
import { TmSeriesPlugin } from './TmSeriesPlugin';
import { PivotPlugin } from './PivotPlugin';
import { TimeSeriesEnginePlugin } from './TimeSeriesEnginePlugin';
import { ReactiveStateEnginePlugin } from './ReactiveStateEnginePlugin';
import { CrossSectionalEnginePlugin } from './CrossSectionalEnginePlugin';
import { AsofPlugin } from './AsofPlugin';
import { AggrTopNPlugin } from './AggrTopNPlugin';
import { EachLeftPlugin } from './EachLeftPlugin';
import { EachRightPlugin } from './EachRightPlugin';
import { EachPrePlugin } from './EachPrePlugin';
import { EachPostPlugin } from './EachPostPlugin';
import { GroupbyPlugin } from './GroupbyPlugin';
import { ContextbyPlugin } from './ContextbyPlugin';
import { SegmentbyPlugin } from './SegmentbyPlugin';
import { WindowPlugin } from './WindowPlugin';
import { TWindowPlugin } from './TWindowPlugin';
import { RollingPlugin } from './RollingPlugin';

export const plugins = [
  AccumulatePlugin,
  ConditionalIteratePlugin,
  TmSeriesPlugin,
  PivotPlugin,
  TimeSeriesEnginePlugin,
  ReactiveStateEnginePlugin,
  CrossSectionalEnginePlugin,
  AsofPlugin,
  AggrTopNPlugin,
  EachLeftPlugin,
  EachRightPlugin,
  EachPrePlugin,
  EachPostPlugin,
  GroupbyPlugin,
  ContextbyPlugin,
  SegmentbyPlugin,
  WindowPlugin,
  TWindowPlugin,
  RollingPlugin
];

export const registerPlugins = () => {
  plugins.forEach(plugin => {
    PluginRegistry.register(plugin);
  });
};
