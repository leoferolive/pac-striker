'use client'

import { useGameStore } from '@/store/useGameStore'
import { MainMenu } from './MainMenu'
import { PauseMenu } from './PauseMenu'

export function GameOverlay() {
    const gameState = useGameStore(state => state.gameState)
    const score = useGameStore(state => state.score)
    const health = useGameStore(state => state.health)
    const wave = useGameStore(state => state.wave)

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* HUD - Always visible when playing or paused */}
            {(gameState === 'playing' || gameState === 'paused') && (
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-white font-bold text-xl pointer-events-auto">
                    <div className="flex gap-8">
                        <div className="text-red-400">HP: {Math.ceil(health)}</div>
                        <div className="text-yellow-400">WAVE: {wave}</div>
                    </div>
                    <div className="text-cyan-400">SCORE: {score}</div>
                </div>
            )}

            {/* Menus - Enable pointer events for interaction */}
            {gameState === 'menu' && (
                <div className="pointer-events-auto w-full h-full">
                    <MainMenu />
                </div>
            )}
            {gameState === 'paused' && (
                <div className="pointer-events-auto w-full h-full">
                    <PauseMenu />
                </div>
            )}
            {gameState === 'gameover' && (
                <div className="pointer-events-auto w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-50">
                    <h2 className="text-5xl font-bold mb-4 text-red-500">GAME OVER</h2>
                    <p className="text-2xl mb-8">Final Score: {score}</p>
                    <button
                        onClick={() => useGameStore.getState().restartGame()}
                        className="px-8 py-4 text-xl font-bold bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all"
                    >
                        TRY AGAIN
                    </button>
                    <button
                        onClick={() => useGameStore.getState().goToMenu()}
                        className="mt-4 px-6 py-2 text-lg text-gray-400 hover:text-white transition-all"
                    >
                        Main Menu
                    </button>
                </div>
            )}
        </div>
    )
}
