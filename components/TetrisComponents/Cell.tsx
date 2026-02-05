import { View } from 'react-native';
import { CellOptions } from '../../utils/types';

interface Props {
    type: CellOptions;
}

const cellColors: Record<CellOptions, string> = {
    Empty: 'bg-red-900',
    I: 'bg-cyan-400',
    J: 'bg-blue-600',
    L: 'bg-orange-500',
    O: 'bg-yellow-400',
    S: 'bg-green-500',
    T: 'bg-purple-600',
    Z: 'bg-red-600',
};

function Cell({ type }: Props) {
    return (
        <View
            className={`w-6 h-6 border border-gray-700 ${cellColors[type]}`}
        />
    );
}

export default Cell;