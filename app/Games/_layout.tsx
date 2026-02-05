import { Stack } from "expo-router";

export default function GameLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="Tetris"
                options={{
                    headerShown: false
                }} />
            <Stack.Screen
                name="FloveyBird"
                options={{
                    headerShown: false
                }} />
        </Stack>
    );
}