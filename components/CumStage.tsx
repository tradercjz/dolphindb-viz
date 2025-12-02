import React from 'react';
import { Text, RoundedBox, Line } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { CumStep } from '../hooks/useCumLogic';
import { COLORS } from '../constants';

interface CumStageProps {
  progress: number;
  steps: CumStep[];
  func: string;
}

export const CumStage: React.FC<CumStageProps> = ({ progress, steps, func }) => {
  const stepIndex = Math.min(Math.floor(progress), steps.length - 1);
  const currentStep = steps[stepIndex];
  const subProgress = progress - stepIndex;

  if (!currentStep) return null;

  const isBinary = ['cumwsum', 'cumwavg', 'cumcovar', 'cumcorr', 'cumbeta'].includes(func);

  // Calculate window width
  // Items are spaced by 1.2
  const itemSpacing = 1.2;
  const startX = -((steps.length - 1) * itemSpacing) / 2;
  
  // Window covers from index 0 to stepIndex
  const windowWidth = (stepIndex + 1) * itemSpacing; // Roughly
  // Actually, let's draw the bracket from startX - 0.5 to currentX + 0.5
  const currentX = startX + stepIndex * itemSpacing;
  const windowStartX = startX - 0.6;
  const windowEndX = currentX + 0.6;
  const windowCenterX = (windowStartX + windowEndX) / 2;
  const actualWindowWidth = windowEndX - windowStartX;

  return (
    <group position={[0, 0, 0]}>
      <Text position={[0, 5, 0]} fontSize={0.6} color="white" fontWeight="bold">
        {func}(X{isBinary ? ', Y' : ''})
      </Text>

      {/* Input Row X */}
      <Text position={[-6, 2, 0]} fontSize={0.4} color="#aaa">X</Text>
      {currentStep.inputX.map((val, i) => (
        <InputItem 
            key={`x-${i}`} 
            val={val} 
            x={startX + i * itemSpacing} 
            y={2} 
            isActive={i <= stepIndex}
            isCurrent={i === stepIndex}
        />
      ))}

      {/* Input Row Y (if binary) */}
      {isBinary && (
        <>
            <Text position={[-6, 0.5, 0]} fontSize={0.4} color="#aaa">Y</Text>
            {currentStep.inputY.map((val, i) => (
                <InputItem 
                    key={`y-${i}`} 
                    val={val} 
                    x={startX + i * itemSpacing} 
                    y={0.5} 
                    isActive={i <= stepIndex}
                    isCurrent={i === stepIndex}
                    color={COLORS.secondary}
                />
            ))}
        </>
      )}

      {/* Window Bracket */}
      <animated.group position={[windowCenterX, 1.25, 0]}>
         <Line 
            points={[
                [-actualWindowWidth/2, -1.5, 0], 
                [-actualWindowWidth/2, 1.5, 0], 
                [actualWindowWidth/2, 1.5, 0], 
                [actualWindowWidth/2, -1.5, 0]
            ]} 
            color={COLORS.gold} 
            lineWidth={3} 
            transparent
            opacity={0.6}
         />
         <Text position={[0, 2, 0]} fontSize={0.3} color={COLORS.gold}>
            Window [0:{stepIndex}]
         </Text>
      </animated.group>

      {/* Calculation Callout */}
      <group position={[0, -1.5, 0]}>
        <Text fontSize={0.4} color={COLORS.primary}>
            {currentStep.calculation}
        </Text>
      </group>

      {/* Result Row */}
      <Text position={[-6, -3, 0]} fontSize={0.4} color="#aaa">Result</Text>
      {currentStep.resultVector.map((val, i) => (
        <ResultItem 
            key={`res-${i}`} 
            val={val} 
            x={startX + i * itemSpacing} 
            y={-3} 
            isNew={i === stepIndex}
        />
      ))}
    </group>
  );
};

const InputItem: React.FC<{ val: number; x: number; y: number; isActive: boolean; isCurrent: boolean; color?: string }> = ({ val, x, y, isActive, isCurrent, color = COLORS.primary }) => {
    const { scale } = useSpring({ scale: isActive ? 1.1 : 1 });
    
    return (
        <animated.group position={[x, y, 0]} scale={scale}>
            <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.1}>
                <meshStandardMaterial color={isActive ? color : '#555'} />
            </RoundedBox>
            <Text position={[0, 0, 0.1]} fontSize={0.35} color={isActive ? "black" : "#aaa"}>
                {val}
            </Text>
            {isCurrent && (
                <Text position={[0, 0.6, 0]} fontSize={0.2} color="white">
                    ▼
                </Text>
            )}
        </animated.group>
    );
};

const ResultItem: React.FC<{ val: number; x: number; y: number; isNew: boolean }> = ({ val, x, y, isNew }) => {
    const { scale } = useSpring({ scale: isNew ? 1.2 : 1, config: { tension: 200, friction: 10 } });

    return (
        <animated.group position={[x, y, 0]} scale={scale}>
            <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.1}>
                <meshStandardMaterial color={COLORS.success} />
            </RoundedBox>
            <Text position={[0, 0, 0.1]} fontSize={0.35} color="black" fontWeight="bold">
                {val}
            </Text>
        </animated.group>
    );
};
