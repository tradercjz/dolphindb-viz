import React, { useMemo } from 'react';
import { Text, RoundedBox, Line } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { Value, ValueType } from '../hooks/useFlattenLogic';
import { COLORS } from '../constants';

interface FlattenStageProps {
  progress: number; // 0 to 1
  logic: {
      input: Value | null;
      output: Value | null;
      error: string | null;
  };
}

// Helper to calculate layout
type NodeType = ValueType | 'bracket' | 'comma' | 'group';

interface LayoutNode {
    id: string;
    val: string | number;
    x: number;
    y: number;
    type: NodeType;
    width: number;
    height: number;
    children: LayoutNode[];
}

const SCALAR_WIDTH = 0.8;
const BRACKET_WIDTH = 0.4;
const COMMA_WIDTH = 0.3;

const calculateLayout = (v: Value, startX: number, startY: number): LayoutNode => {
    if (v.type === 'scalar') {
        return {
            id: v.id,
            val: v.val,
            x: startX + SCALAR_WIDTH / 2, // Center
            y: startY,
            type: 'scalar',
            width: SCALAR_WIDTH,
            height: 1,
            children: []
        };
    }

    if (v.type === 'vector' || v.type === 'tuple') {
        const elements = v.val as Value[];
        let currentX = startX;
        const childrenNodes: LayoutNode[] = [];
        
        // Left Bracket
        const leftChar = v.type === 'tuple' ? '(' : '[';
        childrenNodes.push({
            id: `${v.id}-left`,
            val: leftChar,
            x: currentX + BRACKET_WIDTH / 2,
            y: startY,
            type: 'bracket',
            width: BRACKET_WIDTH,
            height: 1,
            children: []
        });
        currentX += BRACKET_WIDTH;

        // Elements
        elements.forEach((e, i) => {
            const layout = calculateLayout(e, currentX, startY);
            childrenNodes.push(layout);
            currentX += layout.width;
            
            // Comma
            if (i < elements.length - 1) {
                childrenNodes.push({
                    id: `${v.id}-comma-${i}`,
                    val: ',',
                    x: currentX + COMMA_WIDTH / 2,
                    y: startY,
                    type: 'comma',
                    width: COMMA_WIDTH,
                    height: 1,
                    children: []
                });
                currentX += COMMA_WIDTH;
            }
        });
        
        // Right Bracket
        const rightChar = v.type === 'tuple' ? ')' : ']';
        childrenNodes.push({
            id: `${v.id}-right`,
            val: rightChar,
            x: currentX + BRACKET_WIDTH / 2,
            y: startY,
            type: 'bracket',
            width: BRACKET_WIDTH,
            height: 1,
            children: []
        });
        currentX += BRACKET_WIDTH;

        const totalWidth = currentX - startX;
        
        return {
            id: v.id,
            val: '',
            x: startX + totalWidth / 2, // Center of the group
            y: startY,
            type: 'group', // Use generic group type for container
            width: totalWidth,
            height: 1,
            children: childrenNodes
        };
    }
    
    return { id: 'err', val: '', x: 0, y: 0, type: 'scalar', width: 0, height: 0, children: [] };
};

// Flatten the tree to get all scalar nodes for animation
const getScalarNodes = (node: LayoutNode): LayoutNode[] => {
    if (node.type === 'scalar') return [node];
    return node.children.flatMap(getScalarNodes);
};

export const FlattenStage: React.FC<FlattenStageProps> = ({ progress, logic }) => {
  if (logic.error || !logic.input || !logic.output) {
      return <Text color="red">{logic.error || 'No Data'}</Text>;
  }

  // Calculate layouts (Y is always 0, we position groups)
  const inputLayout = useMemo(() => calculateLayout(logic.input!, 0, 0), [logic.input]);
  const outputLayout = useMemo(() => calculateLayout(logic.output!, 0, 0), [logic.output]);

  // Center layouts
  const inputOffsetX = -inputLayout.width / 2;
  const outputOffsetX = -outputLayout.width / 2;

  // Map IDs to positions
  const nodePositions = useMemo(() => {
      const map = new Map<string, { start: [number, number, number], end: [number, number, number] }>();
      
      const inputScalars = getScalarNodes(inputLayout);
      const outputScalars = getScalarNodes(outputLayout);
      
      // Start positions (Input at y=1.5)
      inputScalars.forEach(n => {
          map.set(n.id, { 
              start: [n.x + inputOffsetX, 1.5, 0], 
              end: [n.x + inputOffsetX, 1.5, 0] 
          });
      });
      
      // End positions (Output at y=-1.5)
      outputScalars.forEach(n => {
          if (map.has(n.id)) {
              const entry = map.get(n.id)!;
              entry.end = [n.x + outputOffsetX, -1.5, 0];
          } else {
              // Should not happen
          }
      });
      
      return map;
  }, [inputLayout, outputLayout, inputOffsetX, outputOffsetX]);

  return (
    <group>
        <Text position={[0, 5.5, 0]} fontSize={0.6} color="white" fontWeight="bold">
            flatten(X)
        </Text>

        {/* Input Structure (Static, Ghosted) */}
        <group position={[0, 1.5, 0]}>
             <StructureVisual node={inputLayout} opacity={0.2} />
             {/* Also render static scalars for input context */}
             {getScalarNodes(inputLayout).map(n => (
                 <group key={'static-' + n.id} position={[n.x + inputOffsetX, 0, 0]}>
                     <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.1}>
                        <meshStandardMaterial color={COLORS.secondary} transparent opacity={0.2} />
                     </RoundedBox>
                     <Text position={[0, 0, 0.1]} fontSize={0.35} color="white" fillOpacity={0.2}>
                        {n.val}
                     </Text>
                 </group>
             ))}
        </group>

        {/* Output Structure (Fade In) */}
        <animated.group position={[0, -1.5, 0]} visible={progress > 0.1}>
             <StructureVisual node={outputLayout} opacity={progress} />
        </animated.group>

        {/* Animated Items (Moving from Input to Output) */}
        {Array.from(nodePositions.entries()).map(([id, pos]) => {
            const node = getScalarNodes(inputLayout).find(n => n.id === id) || getScalarNodes(outputLayout).find(n => n.id === id);
            if (!node) return null;
            
            return (
                <AnimatedItem 
                    key={id}
                    val={node.val}
                    startPos={pos.start}
                    endPos={pos.end}
                    progress={progress}
                />
            );
        })}
    </group>
  );
};

const AnimatedItem = ({ val, startPos, endPos, progress }: { 
    val: string | number, 
    startPos: [number, number, number], 
    endPos: [number, number, number], 
    progress: number 
}) => {
    const { pos } = useSpring({
        pos: progress > 0.5 ? endPos : startPos,
        config: config.wobbly
    });

    return (
        <animated.group position={pos}>
            <RoundedBox args={[0.8, 0.8, 0.1]} radius={0.1}>
                <meshStandardMaterial color={COLORS.primary} />
            </RoundedBox>
            <Text position={[0, 0, 0.1]} fontSize={0.35} color="white">
                {val}
            </Text>
        </animated.group>
    );
};

// Recursive component to draw brackets/structure
const StructureVisual = ({ node, opacity = 1 }: { node: LayoutNode, opacity?: number }) => {
    // If it's a leaf node (bracket or comma), render it
    if (node.type === 'bracket' || node.type === 'comma') {
        return (
            <Text 
                position={[0, 0, 0]} // Render at local origin (parent group handles positioning)
                fontSize={node.type === 'bracket' ? 0.6 : 0.4} 
                color="white" 
                fillOpacity={opacity} 
                anchorX="center" 
                anchorY="middle"
            >
                {node.val}
            </Text>
        );
    }

    // If scalar, do nothing (handled by AnimatedItem)
    if (node.type === 'scalar') return null;

    // If group, render children
    return (
        <group>
            {node.children.map((child) => (
                <group key={child.id} position={[child.x - node.x, child.y - node.y, 0]}>
                     <StructureVisual node={child} opacity={opacity} />
                </group>
            ))}
        </group>
    );
};
