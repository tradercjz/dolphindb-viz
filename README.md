# DolphinDB Function Visualizer

A powerful 3D visualization tool designed to help developers and users understand the internal logic and data flow of DolphinDB's complex functions, specifically focusing on state iteration, windowing, and table operations.

## Overview

DolphinDB provides a rich set of functions for high-performance time-series data analysis. However, understanding the precise behavior of functions like `accumulate`, `window`, or various state engines can be challenging. This project visualizes these functions step-by-step in an interactive 3D environment, making the abstract concepts concrete and easy to grasp.

## Features

- **Interactive 3D Visualization**: View data transformations in a 3D space.
- **Step-by-Step Execution**: Control the progress of the function execution to see exactly how data is processed at each step.
- **Parameter Configuration**: Dynamically adjust function parameters to see how they affect the result.
- **Wide Range of Functions**: Supports a comprehensive list of DolphinDB functions.

## Supported Functions

The visualizer currently supports the following DolphinDB functions and operations:

### Data Manipulation & Transformation
- **Basic Operations**: `accumulate`, `conditionalIterate`, `flatten`, `regroup`, `reshape`, `shuffle`, `shuffleInPlace`, `ungroup`
- **Table Operations**: `pivot`, `concatMatrix`, `join`, `joinInPlace`, `merge`, `union`, `unionAll`
- **Sorting & TopN**: `aggrTopN`, `cumTopN`, `tmTopN`

### Grouping & Windowing
- **Grouping**: `groupby`, `contextby`, `segmentby`, `rowGroupby`, `groups`
- **Windowing**: `window`, `twindow` (Time Window), `rolling`
- **Discretization**: `bar`, `bucket`, `cutPoints`, `dailyAlignedBar`, `digitize`, `segment`, `volumeBar`

### Time-Series & Moving Functions
- **Moving Functions**: `mFunctions` (Moving), `tmFunctions` (Time Moving), `tmoving`
- **Cumulative**: `cum`
- **Time-Series**: `tmSeries`, `asof`

### Higher-Order Functions
- **Iteration**: `eachLeft`, `eachRight`, `eachPre`, `eachPost`
- **Row Operations**: `rowFunctions`

### Streaming Engines
- `TimeSeriesEngine`
- `ReactiveStateEngine`
- `CrossSectionalEngine`

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tradercjz/dolphindb-viz.git
   cd dolphindb-stateiterate-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Usage

1. **Select a Function**: Use the sidebar to choose the DolphinDB function you want to visualize.
2. **Configure Parameters**: Adjust the input parameters (e.g., input vector `X`, window size `window`, etc.) in the control panel.
3. **Control Playback**: Use the slider or play button to step through the visualization.
   - **Input Data**: See the initial state of your data.
   - **Processing**: Watch how the function groups, iterates, or transforms the data.
   - **Result**: View the final output.

## Technologies Used

- **React**: UI framework.
- **Vite**: Build tool.
- **Three.js / React Three Fiber**: 3D rendering engine.
- **DolphinDB**: The database system whose functions are being visualized.

## License

[MIT](LICENSE)
