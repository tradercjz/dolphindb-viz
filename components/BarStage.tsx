import React from 'react';
import { Text, RoundedBox, Line } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { BarItem } from '../hooks/useBarLogic';
import { COLORS } from '../constants';

interface BarStageProps {
  progress: number; // 0 to 4
  logic: {
      items: BarItem[];
      interval: number;
      closed: 'left' | 'right';
      grid: number[];
      error: string | null;
  };
}

const X_SCALE = 0.8;

export const BarStage: React.FC<BarStageProps> = ({ progress, logic }) => {
  if (logic.error) {
      return <Text color="red">{logic.error}</Text>;
  }

  if (logic.items.length === 0) {
      return <Text color="gray">No Data</Text>;
  }

  // Center the visualization
  const minVal = logic.grid[0];
  const maxVal = logic.grid[logic.grid.length - 1];
  const centerOffset = -((minVal + maxVal) / 2) * X_SCALE;

  return (
    <group position={[centerOffset, 0, 0]}>
        <Text position={[-centerOffset, 5.5, 0]} fontSize={0.6} color="white" fontWeight="bold">
            bar(X, {logic.interval}, closed='{logic.closed}')
        </Text>

        {/* Grid / Intervals */}
        <group position={[0, -2, 0]}>
            <Line 
                points={[[minVal * X_SCALE - 2, 0, 0], [maxVal * X_SCALE + 2, 0, 0]]} 
                color="#555" 
                lineWidth={2} 
            />
            {logic.grid.map((val, i) => {
                // Draw interval region if not last
                if (i < logic.grid.length - 1) {
                    const nextVal = logic.grid[i+1];
                    const width = (nextVal - val) * X_SCALE;
                    const centerX = (val * X_SCALE) + width / 2;
                    return (
                        <group key={`interval-${val}`}>
                            <GridMark val={val} />
                            {/* Interval shading */}
                            <mesh position={[centerX, 0.5, -0.1]}>
                                <planeGeometry args={[width - 0.1, 2]} />
                                <meshBasicMaterial color="#333" transparent opacity={0.2} />
                            </mesh>
                        </group>
                    );
                }
                return <GridMark key={val} val={val} />;
            })}
        </group>

        {/* Items */}
        {logic.items.map((item, i) => (
            <Item 
                key={item.id} 
                item={item} 
                progress={progress} 
                closed={logic.closed}
                index={i}
            />
        ))}
    </group>
  );
};

const GridMark = ({ val }: { val: number }) => {
    return (
        <group position={[val * X_SCALE, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshStandardMaterial color="#555" />
            </mesh>
            <Text position={[0, -0.5, 0]} fontSize={0.4} color="#888">
                {val}
            </Text>
        </group>
    );
};

const Item = ({ item, progress, closed, index }: { item: BarItem, progress: number, closed: 'left' | 'right', index: number }) => {
    // Phase 0-1: Show original
    // Phase 1-2: Show calculation / formula
    // Phase 2-3: Move to target
    // Phase 3-4: Final state

    const isMoving = progress >= 2;
    const isDone = progress >= 3;

    // Target X position
    const targetX = (isMoving ? item.barVal : item.val) * X_SCALE;
    
    // Stagger Y position slightly to avoid overlap if values are close
    const y = 1.5 + (index % 2) * 0.5;

    const { x, valColor } = useSpring({
        x: targetX,
        valColor: isDone ? COLORS.success : COLORS.funcCol,
        config: { tension: 120, friction: 14 }
    });

    // Formula visibility
    const showFormula = progress >= 1 && progress < 3;
    const { formulaOpacity } = useSpring({
        formulaOpacity: showFormula ? 1 : 0
    });

    return (
        <animated.group position-x={x} position-y={y}>
            {/* The Value Box */}
            <RoundedBox args={[1, 1, 0.2]} radius={0.1}>
                <animated.meshStandardMaterial color={valColor} />
            </RoundedBox>
            <Text position={[0, 0, 0.11]} fontSize={0.5} color="white" fontWeight="bold">
                {isDone ? item.barVal : item.val}
            </Text>

            {/* Connection Line to Grid (visual guide) */}
            <Line 
                points={[[0, -0.5, 0], [0, -3.5, 0]]} 
                color={COLORS.funcCol} 
                lineWidth={1} 
                transparent 
                opacity={0.3} 
            />

            {/* Formula / Calculation Logic */}
            <animated.group position={[0, 1.2, 0]} scale={formulaOpacity}>
                <Text fontSize={0.3} color="#aaa">
                    {item.formula}
                </Text>
            </animated.group>

            {/* Arrow indicating movement direction (during phase 1-2) */}
            {progress >= 1 && progress < 2 && item.val !== item.barVal && (
                <group position={[0, -1.5, 0]}>
                    <Text fontSize={0.4} color={COLORS.secondary}>
                        {item.barVal > item.val ? "→" : "←"}
                    </Text>
                </group>
            )}
        </animated.group>
    );
};
