import { StyleSheet, View } from 'react-native';
import { Block, SHAPES } from '../../utils/types';

interface Props {
    upcomingBlocks: Block[];
}

function UpcomingBlocks({ upcomingBlocks }: Props) {
    return (
        <View style={styles.upcoming} className='w-full flex-row gap-8 items-center justify-center'>
            {upcomingBlocks.map((block, blockIndex) => {
                const shape = SHAPES[block].shape.filter((row) =>
                    row.some((cell) => cell)
                );
                return (
                    <View key={blockIndex} style={styles.blockContainer}>
                        {shape.map((row, rowIndex) => {
                            return (
                                <View key={rowIndex} style={styles.row}>
                                    {row.map((isSet, cellIndex) => {
                                        return (
                                            <View
                                                key={`${blockIndex}-${rowIndex}-${cellIndex}`}
                                                style={[
                                                    styles.cell,
                                                    isSet ? styles[block] : styles.hidden
                                                ]}
                                            />
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    upcoming: {
        padding: 12,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
    },
    blockContainer: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    hidden: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    // Add styles for each tetromino type
    I: {
        backgroundColor: '#00f0f0',
    },
    J: {
        backgroundColor: '#0000f0',
    },
    L: {
        backgroundColor: '#f0a000',
    },
    O: {
        backgroundColor: '#f0f000',
    },
    S: {
        backgroundColor: '#00f000',
    },
    T: {
        backgroundColor: '#a000f0',
    },
    Z: {
        backgroundColor: '#f00000',
    },
});

export default UpcomingBlocks;