import { useMemo } from 'react';

export type ValueType = 'scalar' | 'vector' | 'tuple' | 'matrix';

export interface Value {
    type: ValueType;
    val: any; // number, Value[], or Value[][]
    id: string; // Unique ID for animation
}

let idCounter = 0;
const generateId = () => `node-${idCounter++}`;

export const useFlattenLogic = (xStr: string) => {
    return useMemo(() => {
        idCounter = 0;
        
        // Parser
        const parse = (str: string): Value => {
            str = str.trim();
            if (str.startsWith('(') && str.endsWith(')')) {
                // Tuple
                const inner = str.slice(1, -1);
                const parts = splitByComma(inner);
                return {
                    type: 'tuple',
                    val: parts.map(parse),
                    id: generateId()
                };
            } else if (str.startsWith('[') && str.endsWith(']')) {
                // Vector or Matrix (if nested arrays)
                // For simplicity, let's assume [...] is vector unless it contains vectors, then it's matrix?
                // But in DolphinDB, [1, 2] is vector. [[1,2], [3,4]] is matrix (or vector of vectors).
                // Let's parse as vector first, then check content.
                const inner = str.slice(1, -1);
                const parts = splitByComma(inner);
                const elements = parts.map(parse);
                
                // Check if matrix (all elements are vectors of same length)
                // Or just treat as vector of vectors for now, flatten will handle it.
                // Actually, flatten treats Matrix differently (flattens to vector).
                // Vector of vectors (if not matrix) -> flatten([1, [2,3]]) -> [1, 2, 3].
                
                return {
                    type: 'vector',
                    val: elements,
                    id: generateId()
                };
            } else {
                // Scalar
                const n = Number(str);
                return {
                    type: 'scalar',
                    val: isNaN(n) ? str : n,
                    id: generateId()
                };
            }
        };

        const splitByComma = (str: string): string[] => {
            const parts: string[] = [];
            let current = '';
            let depth = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (char === '(' || char === '[') depth++;
                if (char === ')' || char === ']') depth--;
                
                if (char === ',' && depth === 0) {
                    parts.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            if (current.trim()) parts.push(current.trim());
            return parts;
        };

        // Flatten Logic
        const flatten = (v: Value): Value => {
            if (v.type === 'scalar') return { ...v, type: 'vector', val: [v] }; // Scalar -> Vector? flatten(1) -> [1]
            
            if (v.type === 'vector') {
                // Flatten vector: [1, [2,3]] -> [1, 2, 3]
                // Recursively flatten elements and concat
                const flattenedElements: Value[] = [];
                const process = (item: Value) => {
                    if (item.type === 'scalar') {
                        flattenedElements.push(item);
                    } else if (item.type === 'vector' || item.type === 'tuple') {
                        (item.val as Value[]).forEach(process);
                    }
                };
                (v.val as Value[]).forEach(process);
                return {
                    type: 'vector',
                    val: flattenedElements,
                    id: v.id
                };
            }

            if (v.type === 'tuple') {
                const elements = v.val as Value[];
                const hasTuple = elements.some(e => e.type === 'tuple');
                
                if (hasTuple) {
                    // Recursive step: flatten tuple elements
                    const newElements = elements.map(e => {
                        if (e.type === 'tuple') {
                            return flatten(e);
                        } else {
                            return e;
                        }
                    });
                    return {
                        type: 'tuple',
                        val: newElements,
                        id: v.id
                    };
                } else {
                    // No nested tuples: Flatten to vector
                    const flattenedElements: Value[] = [];
                    const process = (item: Value) => {
                        if (item.type === 'scalar') {
                            flattenedElements.push(item);
                        } else if (item.type === 'vector' || item.type === 'tuple') {
                            (item.val as Value[]).forEach(process);
                        }
                    };
                    elements.forEach(process);
                    return {
                        type: 'vector',
                        val: flattenedElements,
                        id: v.id
                    };
                }
            }
            
            return v;
        };

        let input: Value;
        try {
            input = parse(xStr);
        } catch (e) {
            return { input: null, output: null, error: 'Parse error' };
        }

        const output = flatten(input);

        return { input, output, error: null };
    }, [xStr]);
};
