export type ValueType = 'scalar' | 'vector' | 'tuple' | 'matrix';

export interface Value {
    type: ValueType;
    val: any; // number, Value[], or Value[][]
    id: string; // Unique ID for animation
}

let idCounter = 0;
export const generateId = () => `node-${idCounter++}`;
export const resetIdCounter = () => { idCounter = 0; };

export const splitByComma = (str: string): string[] => {
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

export const parse = (str: string): Value => {
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
        // Vector or Matrix
        const inner = str.slice(1, -1);
        const parts = splitByComma(inner);
        const elements = parts.map(parse);
        
        // Check if it's a matrix (all elements are vectors of same length)
        const isMatrix = elements.length > 0 && 
                         elements.every(e => e.type === 'vector') &&
                         elements.every(e => (e.val as Value[]).length === (elements[0].val as Value[]).length);

        return {
            type: isMatrix ? 'matrix' : 'vector',
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
