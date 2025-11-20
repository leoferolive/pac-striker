'use client'

import { useGameStore } from '@/store/useGameStore'

export function PauseMenu() {
    const { resumeGame, restartGame, goToMenu } = useGameStore()

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <h2 className="text-4xl font-bold mb-8 text-white">PAUSED</h2>

            <div className="flex flex-col gap-4 w-64">
                <button
                    onClick={resumeGame}
                    className="px-6 py-3 text-xl font-bold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all"
                >
                    RESUME
                </button>

                <button
                    onClick={restartGame}
                    className="px-6 py-3 text-xl font-bold bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-all"
                >
                    RESTART
                </button>

                <button
                    onClick={goToMenu}
                    className="px-6 py-3 text-xl font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                >
                    MAIN MENU
                </button>
            </div>
        </div>
    )
}
