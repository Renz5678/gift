export type TimerMode = 'work' | 'break' | 'longBreak'

export interface PomodoroState {
    workMinutes: number
    breakMinutes: number
    timeLeft: number
    mode: TimerMode
    cycleCount: number
    isRunning: boolean
}

export interface TimerCompleteResult {
    newMode: TimerMode
    newTimeLeft: number
    newCycleCount: number
    alertTitle: string
    alertMessage: string
}

/**
 * Formats seconds into MM:SS format
 */
export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Gets the display text for the current timer mode
 */
export const getModeText = (mode: TimerMode): string => {
    if (mode === 'work') return 'Work Time'
    if (mode === 'longBreak') return 'Long Break (Every 3 Cycles)'
    return 'Break Time'
}

/**
 * Gets the background color class for the current timer mode
 */
export const getModeColor = (mode: TimerMode): string => {
    if (mode === 'work') return 'bg-red-400'
    if (mode === 'longBreak') return 'bg-purple-400'
    return 'bg-green-400'
}

/**
 * Calculates the next timer state when a session completes
 * Implements the logic for extended 30-minute breaks every 3 cycles
 */
export const calculateTimerComplete = (
    currentMode: TimerMode,
    cycleCount: number,
    breakMinutes: number,
    workMinutes: number
): TimerCompleteResult => {
    if (currentMode === 'work') {
        const newCycleCount = cycleCount + 1

        // Every 3 cycles, give a 30-minute long break
        if (newCycleCount % 3 === 0) {
            return {
                newMode: 'longBreak',
                newTimeLeft: 30 * 60,
                newCycleCount,
                alertTitle: 'Work Complete!',
                alertMessage: 'Great job! Time for a 30-minute extended break! 🎉'
            }
        } else {
            return {
                newMode: 'break',
                newTimeLeft: breakMinutes * 60,
                newCycleCount,
                alertTitle: 'Work Complete!',
                alertMessage: 'Time for a break! ☕'
            }
        }
    } else {
        return {
            newMode: 'work',
            newTimeLeft: workMinutes * 60,
            newCycleCount: cycleCount,
            alertTitle: 'Break Complete!',
            alertMessage: 'Ready to get back to work? 💪'
        }
    }
}

/**
 * Validates custom timer input
 */
export const validateTimerInput = (workInput: string, breakInput: string): {
    isValid: boolean
    work?: number
    breakTime?: number
    error?: string
} => {
    const work = parseInt(workInput)
    const breakTime = parseInt(breakInput)

    if (isNaN(work) || isNaN(breakTime) || work <= 0 || breakTime <= 0) {
        return {
            isValid: false,
            error: 'Please enter valid positive numbers for work and break times.'
        }
    }

    return {
        isValid: true,
        work,
        breakTime
    }
}

/**
 * Calculates how many cycles until the next long break
 */
export const getCyclesUntilLongBreak = (cycleCount: number): number => {
    return 3 - (cycleCount % 3)
}
