import { useCallback, useRef, useState } from 'react';
import {
    BIRD,
    GameState,
    PIPE,
} from '../utils/flappyBirdConstants';
import {
    applyJump,
    checkCollision,
    generatePipe,
    updateBirdPhysics,
    updatePipes,
    updateScore,
} from '../utils/flappyBirdPhysics';
import { useGameLoop } from './useGameLoop';

const INITIAL_STATE: GameState = {
    birdY: BIRD.INITIAL_Y,
    birdVelocity: 0,
    birdRotation: 0,
    pipes: [],
    score: 0,
    isPlaying: false,
    isGameOver: false,
};

export const useFlappyBird = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const pipeIdCounter = useRef(0);
    const lastPipeTime = useRef(0);

    // Game loop callback
    const gameLoop = useCallback(() => {
        if (!gameState.isPlaying || gameState.isGameOver) return;

        setGameState((prevState) => {
            // Update bird physics
            const { y: newBirdY, velocity: newVelocity, rotation: newRotation } =
                updateBirdPhysics(prevState.birdY, prevState.birdVelocity);

            // Update pipes
            let updatedPipes = updatePipes(prevState.pipes);

            // Generate new pipe if needed
            const now = Date.now();
            if (now - lastPipeTime.current > PIPE.SPAWN_INTERVAL) {
                updatedPipes.push(generatePipe(pipeIdCounter.current++));
                lastPipeTime.current = now;
            }

            // Check for score updates
            const { pipes: scoredPipes, score: newScore } = updateScore(
                updatedPipes,
                prevState.score
            );

            // Check collisions
            const hasCollision = checkCollision(newBirdY, scoredPipes);

            return {
                ...prevState,
                birdY: newBirdY,
                birdVelocity: newVelocity,
                birdRotation: newRotation,
                pipes: scoredPipes,
                score: newScore,
                isGameOver: hasCollision,
                isPlaying: !hasCollision,
            };
        });
    }, [gameState.isPlaying, gameState.isGameOver]);

    // Use game loop
    useGameLoop(gameLoop, gameState.isPlaying && !gameState.isGameOver);

    // Jump action
    const jump = useCallback(() => {
        if (gameState.isGameOver) return;

        if (!gameState.isPlaying) {
            // Start game on first tap
            setGameState((prev) => ({
                ...prev,
                isPlaying: true,
                birdVelocity: applyJump(),
            }));
            lastPipeTime.current = Date.now();
        } else {
            setGameState((prev) => ({
                ...prev,
                birdVelocity: applyJump(),
            }));
        }
    }, [gameState.isPlaying, gameState.isGameOver]);

    // Reset game
    const resetGame = useCallback(() => {
        pipeIdCounter.current = 0;
        lastPipeTime.current = 0;
        setGameState(INITIAL_STATE);
    }, []);

    return {
        gameState,
        jump,
        resetGame,
    };
};
