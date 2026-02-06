import {
    calculateTimerComplete,
    formatTime,
    getCyclesUntilLongBreak,
    getModeText,
    TimerMode,
    validateTimerInput
} from '@/utils/pomodoroTimer'
import { Audio } from 'expo-av'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native'

const PomodoroTimer = () => {
    // Timer settings - SET TO 5 SECONDS FOR TESTING
    const [workSeconds, setWorkSeconds] = useState(5) // 5 seconds for testing
    const [breakSeconds, setBreakSeconds] = useState(5) // 5 seconds for break too
    const [customWorkInput, setCustomWorkInput] = useState('25')
    const [customBreakInput, setCustomBreakInput] = useState('5')

    // Timer state
    const [timeLeft, setTimeLeft] = useState(5) // Start with 5 seconds
    const [isRunning, setIsRunning] = useState(false)
    const [mode, setMode] = useState<TimerMode>('work')
    const [cycleCount, setCycleCount] = useState(0)

    // Modal state
    const [showCustomModal, setShowCustomModal] = useState(false)

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const soundRef = useRef<Audio.Sound | null>(null)

    // Load the alarm sound on mount
    useEffect(() => {
        const loadSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('@/assets/audio/timer-ringtone.mp3')
                )
                soundRef.current = sound
            } catch (error) {
                console.error('Error loading alarm sound:', error)
            }
        }

        loadSound()

        // Cleanup sound on unmount
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync()
            }
        }
    }, [])

    // Play alarm sound
    const playAlarmSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.replayAsync()
            }
        } catch (error) {
            console.error('Error playing alarm sound:', error)
        }
    }

    // Stop alarm sound
    const stopAlarmSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync()
            }
        } catch (error) {
            console.error('Error stopping alarm sound:', error)
        }
    }

    // Handle timer completion with useCallback to fix dependency warning
    const handleTimerComplete = useCallback(async () => {
        setIsRunning(false)

        // Play alarm sound
        await playAlarmSound()

        const result = calculateTimerComplete(mode, cycleCount, breakSeconds, workSeconds)

        setMode(result.newMode)
        setTimeLeft(result.newTimeLeft)
        setCycleCount(result.newCycleCount)

        // Show alert and stop sound when user clicks OK
        Alert.alert(
            result.alertTitle,
            result.alertMessage,
            [
                {
                    text: 'OK',
                    onPress: async () => {
                        await stopAlarmSound()
                    }
                }
            ]
        )
    }, [mode, cycleCount, breakSeconds, workSeconds])

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
        setTimeLeft(5) // 5 seconds for testing
        setCycleCount(0)
    }

    const handlePresetStart = () => {
        setWorkSeconds(5) // 5 seconds
        setBreakSeconds(5) // 5 seconds
        setMode('work')
        setTimeLeft(5) // 5 seconds
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
        <View className="p-4 gap-4 mt-28">
            {/* Timer Display */}
            <View className={`w-full p-8 rounded-2xl`}>
                <Text className="text-center text-gray text-xl font-semibold mb-2">
                    {getModeText(mode)}
                </Text>
                <Text className="text-center text-gray text-6xl font-bold mb-4">
                    {formatTime(timeLeft)}
                </Text>
                <Text className="text-center text-gray text-sm">
                    Cycle: {cycleCount} | Next long break: {getCyclesUntilLongBreak(cycleCount)}{' '}
                    cycles
                </Text>
            </View>

            {/* Control Buttons */}
            <View className="flex-row gap-2">
                <Pressable
                    className="flex-1 h-14 bg-red-400 flex justify-center items-center rounded-xl"
                    onPress={isRunning ? pauseTimer : startTimer}
                >
                    <Text className="font-bold text-white text-lg">
                        {isRunning ? 'Pause' : 'Start'}
                    </Text>
                </Pressable>

                <Pressable
                    className="flex-1 h-14 bg-gray-400 flex justify-center items-center rounded-xl"
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
                    <Text className="font-bold">5 seconds work + 5 seconds break (TESTING)</Text>
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
