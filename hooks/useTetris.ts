import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../utils/types';
import { useInterval } from './useInterval';
import {
    BOARD_HEIGHT,
    getEmptyBoard,
    getRandomBlock,
    hasCollisions,
    useTetrisBoard,
} from './useTetrisBoard';

const MAX_HIGH_SCORES = 10;

// Replace localStorage with AsyncStorage
export async function saveHighScore(score: number): Promise<void> {
    try {
        const existing = await AsyncStorage.getItem('highScores');
        const existingScores = JSON.parse(existing || '[]');
        existingScores.push(score);
        const updatedScores = existingScores
            .sort((a: number, b: number) => b - a)
            .slice(0, MAX_HIGH_SCORES);
        await AsyncStorage.setItem('highScores', JSON.stringify(updatedScores));
    } catch (error) {
        console.error('Error saving high score:', error);
    }
}

export async function getHighScores(): Promise<number[]> {
    try {
        const scores = await AsyncStorage.getItem('highScores');
        const parsed = JSON.parse(scores || '[]');
        return Array.isArray(parsed) ? parsed.sort((a, b) => b - a).slice(0, MAX_HIGH_SCORES) : [];
    } catch {
        return [];
    }
}

enum TickSpeed {
    Normal = 1000,
    Sliding = 100,
    Fast = 50,
}

export function useTetris() {
    const [score, setScore] = useState(0);
    const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
    const [isCommitting, setIsCommitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
    const [highScores, setHighScores] = useState<number[]>([]);

    const [
        { board, droppingRow, droppingColumn, droppingBlock, droppingShape },
        dispatchBoardState,
    ] = useTetrisBoard();

    // Load high scores on mount
    useEffect(() => {
        getHighScores().then(setHighScores);
    }, []);

    const startGame = useCallback(() => {
        const startingBlocks = [
            getRandomBlock(),
            getRandomBlock(),
            getRandomBlock(),
        ];
        setScore(0);
        setUpcomingBlocks(startingBlocks);
        setIsCommitting(false);
        setIsPlaying(true);
        setTickSpeed(TickSpeed.Normal);
        dispatchBoardState({ type: 'start' });
    }, [dispatchBoardState]);

    const commitPosition = useCallback(() => {
        if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
            setIsCommitting(false);
            setTickSpeed(TickSpeed.Normal);
            return;
        }

        const newBoard = structuredClone(board) as BoardShape;
        addShapeToBoard(
            newBoard,
            droppingBlock,
            droppingShape,
            droppingRow,
            droppingColumn
        );

        let numCleared = 0;
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
            if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
                numCleared++;
                newBoard.splice(row, 1);
            }
        }

        const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
        const newBlock = newUpcomingBlocks.pop() as Block;
        newUpcomingBlocks.unshift(getRandomBlock());

        if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
            saveHighScore(score).then(() => {
                getHighScores().then(setHighScores);
            });
            setIsPlaying(false);
            setTickSpeed(null);
        } else {
            setTickSpeed(TickSpeed.Normal);
        }
        setUpcomingBlocks(newUpcomingBlocks);
        setScore((prevScore) => prevScore + getPoints(numCleared));
        dispatchBoardState({
            type: 'commit',
            newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
            newBlock,
        });
        setIsCommitting(false);
    }, [
        board,
        dispatchBoardState,
        droppingBlock,
        droppingColumn,
        droppingRow,
        droppingShape,
        upcomingBlocks,
        score,
    ]);

    const gameTick = useCallback(() => {
        if (isCommitting) {
            commitPosition();
        } else if (
            hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)
        ) {
            setTickSpeed(TickSpeed.Sliding);
            setIsCommitting(true);
        } else {
            dispatchBoardState({ type: 'drop' });
        }
    }, [
        board,
        commitPosition,
        dispatchBoardState,
        droppingColumn,
        droppingRow,
        droppingShape,
        isCommitting,
    ]);

    useInterval(() => {
        if (!isPlaying) {
            return;
        }
        gameTick();
    }, tickSpeed);

    // Export control functions for buttons to use
    const moveLeft = useCallback(() => {
        if (!isPlaying) return;
        dispatchBoardState({ type: 'move', isPressingLeft: true, isPressingRight: false });
    }, [dispatchBoardState, isPlaying]);

    const moveRight = useCallback(() => {
        if (!isPlaying) return;
        dispatchBoardState({ type: 'move', isPressingLeft: false, isPressingRight: true });
    }, [dispatchBoardState, isPlaying]);

    const rotate = useCallback(() => {
        if (!isPlaying) return;
        dispatchBoardState({ type: 'move', isRotating: true });
    }, [dispatchBoardState, isPlaying]);

    const moveDown = useCallback(() => {
        if (!isPlaying) return;
        setTickSpeed(TickSpeed.Fast);
    }, [isPlaying]);

    const stopMovingDown = useCallback(() => {
        if (!isPlaying) return;
        setTickSpeed(TickSpeed.Normal);
    }, [isPlaying]);

    const renderedBoard = structuredClone(board) as BoardShape;
    if (isPlaying) {
        addShapeToBoard(
            renderedBoard,
            droppingBlock,
            droppingShape,
            droppingRow,
            droppingColumn
        );
    }

    return {
        board: renderedBoard,
        startGame,
        isPlaying,
        score,
        upcomingBlocks,
        highScores,
        // Control functions
        moveLeft,
        moveRight,
        rotate,
        moveDown,
        stopMovingDown,
    };
}

function getPoints(numCleared: number): number {
    switch (numCleared) {
        case 0:
            return 0;
        case 1:
            return 100;
        case 2:
            return 300;
        case 3:
            return 500;
        case 4:
            return 800;
        default:
            throw new Error('Unexpected number of rows cleared');
    }
}

function addShapeToBoard(
    board: BoardShape,
    droppingBlock: Block,
    droppingShape: BlockShape,
    droppingRow: number,
    droppingColumn: number
) {
    droppingShape
        .filter((row) => row.some((isSet) => isSet))
        .forEach((row: boolean[], rowIndex: number) => {
            row.forEach((isSet: boolean, colIndex: number) => {
                if (isSet) {
                    board[droppingRow + rowIndex][droppingColumn + colIndex] =
                        droppingBlock;
                }
            });
        });
}