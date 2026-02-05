import {
    BIRD,
    COLLISION_PADDING,
    GAME_CONFIG,
    PHYSICS,
    PIPE,
    Pipe,
} from './flappyBirdConstants';

/**
 * Snap position to pixel grid for retro pixelated movement
 */
const snapToGrid = (value: number): number => {
    return Math.round(value / PHYSICS.PIXEL_GRID) * PHYSICS.PIXEL_GRID;
};

/**
 * Update bird's vertical position and velocity based on gravity
 */
export const updateBirdPhysics = (
    currentY: number,
    currentVelocity: number
): { y: number; velocity: number; rotation: number } => {
    let newVelocity = currentVelocity + PHYSICS.GRAVITY;

    // Cap fall speed
    if (newVelocity > PHYSICS.MAX_FALL_SPEED) {
        newVelocity = PHYSICS.MAX_FALL_SPEED;
    }

    const newY = snapToGrid(currentY + newVelocity);

    // Calculate rotation based on velocity
    let rotation = newVelocity * PHYSICS.ROTATION_FACTOR;
    rotation = Math.max(PHYSICS.MAX_ROTATION_UP, Math.min(PHYSICS.MAX_ROTATION_DOWN, rotation));

    return {
        y: newY,
        velocity: newVelocity,
        rotation,
    };
};

/**
 * Apply jump force to bird
 */
export const applyJump = (): number => {
    return PHYSICS.JUMP_VELOCITY;
};

/**
 * Update all pipes' positions
 */
export const updatePipes = (pipes: Pipe[]): Pipe[] => {
    return pipes
        .map((pipe) => ({
            ...pipe,
            x: snapToGrid(pipe.x - PIPE.SPEED),
        }))
        .filter((pipe) => pipe.x > -PIPE.WIDTH); // Remove off-screen pipes
};

/**
 * Generate a new pipe with random gap position
 */
export const generatePipe = (pipeId: number): Pipe => {
    const minTopHeight = PIPE.MIN_HEIGHT;
    const maxTopHeight = GAME_CONFIG.PLAYABLE_HEIGHT - PIPE.GAP - PIPE.MIN_HEIGHT;
    const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;

    return {
        id: pipeId,
        x: GAME_CONFIG.SCREEN_WIDTH,
        topHeight,
        bottomY: topHeight + PIPE.GAP,
        passed: false,
    };
};

/**
 * Check if bird collides with pipes or boundaries
 */
export const checkCollision = (
    birdY: number,
    pipes: Pipe[]
): boolean => {
    // Check ground and ceiling collision
    if (
        birdY < 0 ||
        birdY + BIRD.HEIGHT > GAME_CONFIG.PLAYABLE_HEIGHT
    ) {
        return true;
    }

    // Check pipe collision
    const birdLeft = BIRD.INITIAL_X + COLLISION_PADDING.BIRD;
    const birdRight = BIRD.INITIAL_X + BIRD.WIDTH - COLLISION_PADDING.BIRD;
    const birdTop = birdY + COLLISION_PADDING.BIRD;
    const birdBottom = birdY + BIRD.HEIGHT - COLLISION_PADDING.BIRD;

    for (const pipe of pipes) {
        const pipeLeft = pipe.x + COLLISION_PADDING.PIPE;
        const pipeRight = pipe.x + PIPE.WIDTH - COLLISION_PADDING.PIPE;

        // Check if bird is horizontally aligned with pipe
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Check if bird passed a pipe and update score
 */
export const updateScore = (
    pipes: Pipe[],
    currentScore: number
): { pipes: Pipe[]; score: number } => {
    let newScore = currentScore;
    const updatedPipes = pipes.map((pipe) => {
        if (!pipe.passed && pipe.x + PIPE.WIDTH < BIRD.INITIAL_X) {
            newScore++;
            return { ...pipe, passed: true };
        }
        return pipe;
    });

    return { pipes: updatedPipes, score: newScore };
};
