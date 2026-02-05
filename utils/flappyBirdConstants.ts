import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bird dimensions and properties
export const BIRD = {
    WIDTH: 40,
    HEIGHT: 28,
    INITIAL_X: SCREEN_WIDTH * 0.25,
    INITIAL_Y: SCREEN_HEIGHT * 0.5,
} as const;

// Pipe dimensions and properties
export const PIPE = {
    WIDTH: 60,
    GAP: 180,
    MIN_HEIGHT: 50,
    SPEED: 3,
    SPAWN_INTERVAL: 2000, // milliseconds
} as const;

// Physics constants
export const PHYSICS = {
    GRAVITY: 0.4, // Reduced from 0.6 for gentler fall
    JUMP_VELOCITY: -8, // Reduced from -12 for less exaggerated jump
    MAX_FALL_SPEED: 7, // Reduced from 10 for more control
    ROTATION_FACTOR: 2, // Reduced from 3 for smoother rotation
    MAX_ROTATION_UP: -20, // Reduced from -25 for less dramatic tilt
    MAX_ROTATION_DOWN: 70, // Reduced from 90 for less dramatic tilt
    PIXEL_GRID: 4, // Snap positions to 4px grid for pixelated movement
} as const;

// Game configuration
export const GAME_CONFIG = {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    GROUND_HEIGHT: 100,
    PLAYABLE_HEIGHT: SCREEN_HEIGHT - 100,
} as const;

// Collision detection padding (makes game slightly more forgiving)
export const COLLISION_PADDING = {
    BIRD: 4,
    PIPE: 2,
} as const;

export interface Pipe {
    id: number;
    x: number;
    topHeight: number;
    bottomY: number;
    passed: boolean;
}

export interface GameState {
    birdY: number;
    birdVelocity: number;
    birdRotation: number;
    pipes: Pipe[];
    score: number;
    isPlaying: boolean;
    isGameOver: boolean;
}
