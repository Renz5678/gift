import {
    calculateTimerComplete,
    formatTime,
    getCyclesUntilLongBreak,
    getModeColor,
    getModeText,
    TimerMode,
    validateTimerInput,
} from '@/utils/pomodoroTimer'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native'

const PomodoroTimer = () => {
    // Timer settings
    const [workMinutes, setWorkMinutes] = useState(25)
    const [breakMinutes, setBreakMinutes] = useState(5)
    const [customWorkInput, setCustomWorkInput] = useState('25')
    const [customBreakInput, setCustomBreakInput] = useState('5')

    // Timer state
    const [timeLeft, setTimeLeft] = useState(workMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [mode, setMode] = useState<TimerMode>('work')
    const [cycleCount, setCycleCount] = useState(0)

    // Modal state
    const [showCustomModal, setShowCustomModal] = useState(false)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Handle timer completion with useCallback to fix dependency warning
    const handleTimerComplete = useCallback(() => {
        setIsRunning(false)

        const result = calculateTimerComplete(mode, cycleCount, breakMinutes, workMinutes)

        setMode(result.newMode)
        setTimeLeft(result.newTimeLeft)
        setCycleCount(result.newCycleCount)
        Alert.alert(result.alertTitle, result.alertMessage)
    }, [mode, cycleCount, breakMinutes, workMinutes])

    // Timer countdown effect
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            handleTimerComplete()
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning, timeLeft, handleTimerComplete])

    const startTimer = () => {
        setIsRunning(true)
    }

    const pauseTimer = () => {
        setIsRunning(false)
    }

    const resetTimer = () => {
        setIsRunning(false)
        setMode('work')
        setTimeLeft(workMinutes * 60)
        setCycleCount(0)
    }

    const handlePresetStart = () => {
        setWorkMinutes(25)
        setBreakMinutes(5)
        setMode('work')
        setTimeLeft(25 * 60)
        setCycleCount(0)
        setIsRunning(false)
    }

    const handleCustomSubmit = () => {
        const validation = validateTimerInput(customWorkInput, customBreakInput)

        if (!validation.isValid) {
            Alert.alert('Invalid Input', validation.error!)
            return
        }

        setWorkMinutes(validation.work!)
        setBreakMinutes(validation.breakTime!)
        setMode('work')
        setTimeLeft(validation.work! * 60)
        setCycleCount(0)
        setIsRunning(false)
        setShowCustomModal(false)
    }

    return (
        <View className="p-4 gap-4">
            {/* Timer Display */}
            <View className={`w-full p-8 rounded-2xl ${getModeColor(mode)}`}>
                <Text className="text-center text-white text-lg font-semibold mb-2">
                    {getModeText(mode)}
                </Text>
                <Text className="text-center text-white text-6xl font-bold mb-4">
                    {formatTime(timeLeft)}
                </Text>
                <Text className="text-center text-white text-sm">
                    Cycle: {cycleCount} | Next long break: {getCyclesUntilLongBreak(cycleCount)}{' '}
                    cycles
                </Text>
            </View>

            {/* Control Buttons */}
            <View className="flex-row gap-2">
                <Pressable
                    className="flex-1 h-14 bg-blue-500 flex justify-center items-center rounded-xl"
                    onPress={isRunning ? pauseTimer : startTimer}
                >
                    <Text className="font-bold text-white text-lg">
                        {isRunning ? 'Pause' : 'Start'}
                    </Text>
                </Pressable>

                <Pressable
                    className="flex-1 h-14 bg-gray-500 flex justify-center items-center rounded-xl"
                    onPress={resetTimer}
                >
                    <Text className="font-bold text-white text-lg">Reset</Text>
                </Pressable>
            </View>

            {/* Preset and Custom Buttons */}
            <View className="gap-2 mt-4">
                <Pressable
                    className="w-full h-16 bg-pink-300 p-4 flex justify-center items-center rounded-xl"
                    onPress={handlePresetStart}
                >
                    <Text className="font-bold">25 minutes work + 5 mins break</Text>
                </Pressable>

                <Pressable
                    className="w-full h-16 bg-pink-200 p-4 flex justify-center items-center rounded-xl"
                    onPress={() => setShowCustomModal(true)}
                >
                    <Text className="font-bold">Custom</Text>
                </Pressable>
            </View>

            {/* Custom Time Modal */}
            <Modal
                visible={showCustomModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCustomModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white p-6 rounded-2xl w-4/5 gap-4">
                        <Text className="text-2xl font-bold text-center mb-2">Custom Timer</Text>

                        <View className="gap-2">
                            <Text className="font-semibold text-gray-700">
                                Work Time (minutes):
                            </Text>
                            <TextInput
                                className="border-2 border-gray-300 rounded-lg p-3 text-lg"
                                value={customWorkInput}
                                onChangeText={setCustomWorkInput}
                                keyboardType="numeric"
                                placeholder="Enter work minutes"
                            />
                        </View>

                        <View className="gap-2">
                            <Text className="font-semibold text-gray-700">
                                Break Time (minutes):
                            </Text>
                            <TextInput
                                className="border-2 border-gray-300 rounded-lg p-3 text-lg"
                                value={customBreakInput}
                                onChangeText={setCustomBreakInput}
                                keyboardType="numeric"
                                placeholder="Enter break minutes"
                            />
                        </View>

                        <Text className="text-sm text-gray-600 text-center">
                            💡 You'll get a 30-minute extended break every 3 work cycles!
                        </Text>

                        <View className="flex-row gap-2 mt-2">
                            <Pressable
                                className="flex-1 bg-gray-400 p-3 rounded-lg"
                                onPress={() => setShowCustomModal(false)}
                            >
                                <Text className="text-white font-bold text-center">Cancel</Text>
                            </Pressable>

                            <Pressable
                                className="flex-1 bg-pink-400 p-3 rounded-lg"
                                onPress={handleCustomSubmit}
                            >
                                <Text className="text-white font-bold text-center">Start</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default PomodoroTimer
