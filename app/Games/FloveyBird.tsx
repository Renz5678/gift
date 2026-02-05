import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFlappyBird } from '../../hooks/useFlappyBird';
import { BIRD, GAME_CONFIG, PIPE } from '../../utils/flappyBirdConstants';

export default function FloveyBird() {
    const { gameState, jump, resetGame } = useFlappyBird();

    return (
        <Pressable style={styles.container} onPress={jump}>
            <View style={styles.gameArea}>
                {/* Sky background */}
                <View style={styles.sky} />

                {/* Pipes */}
                {gameState.pipes.map((pipe) => (
                    <View key={pipe.id}>
                        {/* Top pipe */}
                        <View
                            style={[
                                styles.pipe,
                                styles.pipeTop,
                                {
                                    left: pipe.x,
                                    height: pipe.topHeight,
                                },
                            ]}
                        />
                        {/* Bottom pipe */}
                        <View
                            style={[
                                styles.pipe,
                                styles.pipeBottom,
                                {
                                    left: pipe.x,
                                    top: pipe.bottomY,
                                    height: GAME_CONFIG.PLAYABLE_HEIGHT - pipe.bottomY,
                                },
                            ]}
                        />
                    </View>
                ))}

                {/* Bird */}
                <View
                    style={[
                        styles.bird,
                        {
                            top: gameState.birdY,
                            transform: [{ rotate: `${gameState.birdRotation}deg` }],
                        },
                    ]}
                />

                {/* Ground */}
                <View style={styles.ground} />

                {/* Score */}
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{gameState.score}</Text>
                </View>

                {/* Start/Game Over overlay */}
                {!gameState.isPlaying && (
                    <View style={styles.overlay}>
                        <View style={styles.messageBox}>
                            {gameState.isGameOver ? (
                                <>
                                    <Text style={styles.gameOverText}>Game Over!</Text>
                                    <Text style={styles.finalScoreText}>Score: {gameState.score}</Text>
                                    <TouchableOpacity style={styles.button} onPress={resetGame}>
                                        <Text style={styles.buttonText}>Play Again</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.titleText}>Flovey Bird</Text>
                                    <Text style={styles.instructionText}>Tap to Start</Text>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    gameArea: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#c34c4cff',
    },
    sky: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: GAME_CONFIG.PLAYABLE_HEIGHT,
        backgroundColor: '#da8686ff',
    },
    bird: {
        position: 'absolute',
        left: BIRD.INITIAL_X,
        width: BIRD.WIDTH,
        height: BIRD.HEIGHT,
        backgroundColor: '#FFD700',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFA500',
    },
    pipe: {
        position: 'absolute',
        width: PIPE.WIDTH,
        backgroundColor: '#860202ff',
        borderWidth: 3,
        borderColor: '#e80e0eff',
    },
    pipeTop: {
        top: 0,
    },
    pipeBottom: {
        bottom: GAME_CONFIG.GROUND_HEIGHT,
    },
    ground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: GAME_CONFIG.GROUND_HEIGHT,
        backgroundColor: '#DEB887',
        borderTopWidth: 4,
        borderTopColor: '#8B7355',
    },
    scoreContainer: {
        position: 'absolute',
        top: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBox: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    titleText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ea5e5eff',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 20,
        color: '#666',
        marginTop: 10,
    },
    gameOverText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#d9534f',
        marginBottom: 15,
    },
    finalScoreText: {
        fontSize: 28,
        color: '#333',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#5cb85c',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});