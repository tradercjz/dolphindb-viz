import { useMemo } from 'react';

export interface BarItem {
    id: number;
    val: number;
    barVal: number;
    formula: string; // e.g. "12 - 2"
    remainder: number;
}

export const useBarLogic = (interval: number, closed: 'left' | 'right') => {
    // Sample data: mix of numbers to show boundary cases and middle cases
    // Using a fixed set for consistent visualization
    const rawData = [1, 3, 5, 7, 9, 10, 12, 14, 15, 18]; 

    return useMemo(() => {
        const items = rawData.map((val, i) => {
            let barVal = 0;
            let formula = "";
            let remainder = val % interval;
            
            if (closed === 'left') {
                // X - (X % interval)
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

            return {
                id: i,
                val,
                barVal,
                formula,
                remainder
            };
        });

        // Calculate unique bars for grid visualization
        const minBar = Math.min(...items.map(i => i.barVal));
        const maxBar = Math.max(...items.map(i => i.barVal));
        // Generate grid points covering the range
        const grid = [];
        // Start a bit before min
        const start = Math.floor(minBar / interval) * interval - interval;
        const end = Math.ceil(maxBar / interval) * interval + interval * 2;
        
        for (let x = start; x <= end; x += interval) {
            grid.push(x);
        }

        return { items, interval, closed, grid };
    }, [interval, closed]);
};
