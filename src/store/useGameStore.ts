import { create } from 'zustand'

interface GameState {
    score: number
    health: number
    wave: number
    gameState: 'menu' | 'playing' | 'paused' | 'gameover'
    startGame: () => void
    pauseGame: () => void
    resumeGame: () => void
    endGame: () => void
    restartGame: () => void
    goToMenu: () => void
    addScore: (amount: number) => void
    takeDamage: (amount: number) => void
    nextWave: () => void
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    health: 100,
    wave: 1,
    gameState: 'menu',
    startGame: () => set({ gameState: 'playing', score: 0, health: 100, wave: 1 }),
    pauseGame: () => set({ gameState: 'paused' }),
    resumeGame: () => set({ gameState: 'playing' }),
    endGame: () => set({ gameState: 'gameover' }),
    restartGame: () => set({ gameState: 'playing', score: 0, health: 100, wave: 1 }),
    goToMenu: () => set({ gameState: 'menu' }),
    addScore: (amount) => set((state) => ({ score: state.score + amount })),
    takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
    nextWave: () => set((state) => ({ wave: state.wave + 1 })),
}))
