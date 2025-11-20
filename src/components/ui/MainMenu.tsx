'use client'

import { useGameStore } from '@/store/useGameStore'

export function MainMenu() {
    const startGame = useGameStore(state => state.startGame)

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-50">
            <h1 className="text-6xl font-bold mb-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                NEON BREACH
            </h1>
            <button
                onClick={startGame}
                className="px-8 py-4 text-2xl font-bold bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(8,145,178,0.6)]"
            >
                START GAME
            </button>
            <div className="mt-8 text-gray-400 text-sm">
                WASD to Move • Mouse to Aim • Click to Shoot • ESC to Pause
            </div>
        </div>
    )
}
