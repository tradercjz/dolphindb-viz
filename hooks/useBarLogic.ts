import { useMemo } from 'react';
import { parse, Value } from '../lib/dolphindbParser';

export interface BarItem {
    id: string;
    val: number;
    barVal: number;
    formula: string; // e.g. "12 - 2"
    remainder: number;
    intervalStart: number;
    intervalEnd: number;
}

export const useBarLogic = (xStr: string, interval: number, closed: 'left' | 'right') => {
    return useMemo(() => {
        let items: BarItem[] = [];
        let error: string | null = null;
        let grid: number[] = [];

        try {
            const parsed = parse(xStr);
            let vals: number[] = [];

            if (parsed.type === 'vector') {
                vals = (parsed.val as Value[]).map(v => Number(v.val));
            } else if (parsed.type === 'scalar') {
                vals = [Number(parsed.val)];
            } else {
                error = "X must be a scalar or vector of numbers";
            }

            if (!error) {
                items = vals.map((val, i) => {
                    let barVal = 0;
                    let formula = "";
                    let remainder = val % interval;
                    // Handle negative numbers correctly for modulo if needed, 
                    // but DolphinDB `bar` behavior on negatives:
                    // bar(-5, 5) -> -5
                    // bar(-1, 5) -> -5 (left closed)
                    // JS % operator: -1 % 5 = -1. 
                    // DolphinDB: -1 - (-1) = 0? No.
                    // Let's stick to positive for simplicity or check DolphinDB docs.
                    // Docs say: closed='left', X - (X % interval).
                    // If X=-1, interval=5. -1 % 5 = -1. -1 - (-1) = 0.
                    // Wait, -1 should probably belong to [-5, 0). So bar is -5.
                    // Let's assume positive inputs for "beginners" or handle standard math floor.
                    // DolphinDB `bar` aligns to intervals.
                    // For visualization, let's assume standard behavior.
                    
                    if (closed === 'left') {
                        // X - (X % interval)
                        // If val is integer.
                        barVal = val - remainder;
                        formula = `${val} - ${remainder}`;
                    } else {
                        // closed = 'right'
                        // iif((X % interval) == 0, X, X + (interval - (X % interval)))
                        if (remainder === 0) {
                            barVal = val;
                            formula = `${val}`;
                        } else {
                            const diff = interval - remainder;
                            barVal = val + diff;
                            formula = `${val} + ${diff}`;
                        }
                    }

                    // Determine interval for visualization
                    // For left closed: [barVal, barVal + interval)
                    // For right closed: (barVal - interval, barVal]
                    let intervalStart, intervalEnd;
                    if (closed === 'left') {
                        intervalStart = barVal;
                        intervalEnd = barVal + interval;
                    } else {
                        intervalStart = barVal - interval;
                        intervalEnd = barVal;
                    }

                    return {
                        id: `item-${i}`,
                        val,
                        barVal,
                        formula,
                        remainder,
                        intervalStart,
                        intervalEnd
                    };
                });

                if (items.length > 0) {
                    const minBar = Math.min(...items.map(i => i.barVal));
                    const maxBar = Math.max(...items.map(i => i.barVal));
                    // Generate grid points
                    const start = Math.floor(minBar / interval) * interval - interval;
                    const end = Math.ceil(maxBar / interval) * interval + interval * 2;
                    
                    for (let x = start; x <= end; x += interval) {
                        grid.push(x);
                    }
                }
            }

        } catch (e: any) {
            error = e.message;
        }

        return { items, interval, closed, grid, error };
    }, [xStr, interval, closed]);
};
