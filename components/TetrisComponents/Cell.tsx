import { CellOptions } from "@/utils/types"
import { View } from "react-native"

interface Props {
    type: CellOptions
}

export default function Cell({ type }: Props) {
    return <View className={`cell ${type}`} />
}