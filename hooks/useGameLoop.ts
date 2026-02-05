import { useEffect, useRef } from 'react';

/**
 * Custom hook for game loop using requestAnimationFrame
 * @param callback - Function to call on each frame
 * @param isRunning - Whether the game loop should be active
 */
export const useGameLoop = (
    callback: (deltaTime: number) => void,
    isRunning: boolean
) => {
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!isRunning) {
            if (requestRef.current !== undefined) {
                cancelAnimationFrame(requestRef.current);
            }
            previousTimeRef.current = undefined;
            return;
        }

        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = time - previousTimeRef.current;
                callback(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current !== undefined) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isRunning, callback]);
};
