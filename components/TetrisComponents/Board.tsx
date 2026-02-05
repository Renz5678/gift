import { StyleSheet, View } from 'react-native';
import { BoardShape } from '../../utils/types';
import Cell from './Cell';

interface Props {
    currentBoard: BoardShape;
}

function Board({ currentBoard }: Props) {
    return (
        <View style={styles.board} className='w-100 h-100'>
            {currentBoard.map((row, rowIndex) => (
                <View style={styles.row} key={`row-${rowIndex}`}>
                    {row.map((cell, colIndex) => (
                        <Cell key={`cell-${rowIndex}-${colIndex}`} type={cell} />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    board: {
        borderWidth: 4,
        borderColor: '#370606',
        backgroundColor: '#9a3e3e',
    },
    row: {
        flexDirection: 'row',
    },
});

export default Board;