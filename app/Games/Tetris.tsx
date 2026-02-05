import Board from '@/components/TetrisComponents/Board';
import UpcomingBlocks from '@/components/TetrisComponents/UpcomingBlocks';
import { useTetris } from '@/hooks/useTetris';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function Tetris() {
    const {
        board,
        startGame,
        isPlaying,
        score,
        upcomingBlocks,
        moveLeft,
        moveRight,
        rotate,
        moveDown,
        stopMovingDown
    } = useTetris();

    return (
        <View style={styles.app} className='bg-red-400'>
            {/* Top Section - Score and Upcoming Blocks */}
            <View style={styles.topSection}>
                <Text style={styles.score}>Score: {score}</Text>
                {isPlaying && <UpcomingBlocks upcomingBlocks={upcomingBlocks} />}
            </View>

            {/* Middle Section - Game Board */}
            <Board currentBoard={board} />

            {/* Bottom Section - Controls */}
            <View style={styles.bottomSection}>
                {isPlaying ? (
                    <View style={styles.gameControls}>
                        {/* Rotate Button */}
                        <Pressable
                            style={styles.rotateButton}
                            onPress={rotate}
                        >
                            <Text style={styles.controlText}>↻ Rotate</Text>
                        </Pressable>

                        {/* Direction Controls */}
                        <View style={styles.directionControls}>
                            <Pressable
                                style={styles.controlButton}
                                onPress={moveLeft}
                            >
                                <Text style={styles.controlText}>←</Text>
                            </Pressable>

                            <Pressable
                                style={styles.controlButton}
                                onPressIn={moveDown}
                                onPressOut={stopMovingDown}
                            >
                                <Text style={styles.controlText}>↓</Text>
                            </Pressable>

                            <Pressable
                                style={styles.controlButton}
                                onPress={moveRight}
                            >
                                <Text style={styles.controlText}>→</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <Pressable style={styles.button} onPress={startGame}>
                        <Text style={styles.buttonText}>New Game</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    app: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    score: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    gameControls: {
        width: '100%',
        alignItems: 'center',
    },
    rotateButton: {
        backgroundColor: '#9C27B0',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    directionControls: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
    },
    controlButton: {
        backgroundColor: '#2196F3',
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Tetris;