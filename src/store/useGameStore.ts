import { create } from 'zustand'
import { WEAPONS } from '@/lib/constants'

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
    currentWeapon: keyof typeof WEAPONS
    ammo: Record<keyof typeof WEAPONS, number>
    switchWeapon: (weapon: keyof typeof WEAPONS) => void
    consumeAmmo: () => void
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    health: 100,
    wave: 1,
    gameState: 'menu',
    currentWeapon: 'PISTOL',
    ammo: {
        PISTOL: WEAPONS.PISTOL.ammo,
        SHOTGUN: WEAPONS.SHOTGUN.ammo,
        RIFLE: WEAPONS.RIFLE.ammo,
        RAILGUN: WEAPONS.RAILGUN.ammo
    },
    startGame: () => set({ gameState: 'playing', score: 0, health: 100, wave: 1, currentWeapon: 'PISTOL', ammo: { PISTOL: -1, SHOTGUN: 15, RIFLE: 40, RAILGUN: 5 } }),
    pauseGame: () => set({ gameState: 'paused' }),
    resumeGame: () => set({ gameState: 'playing' }),
    endGame: () => set({ gameState: 'gameover' }),
    restartGame: () => set({ gameState: 'playing', score: 0, health: 100, wave: 1, currentWeapon: 'PISTOL', ammo: { PISTOL: -1, SHOTGUN: 15, RIFLE: 40, RAILGUN: 5 } }),
    goToMenu: () => set({ gameState: 'menu' }),
    addScore: (amount) => set((state) => ({ score: state.score + amount })),
    takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
    nextWave: () => set((state) => ({ wave: state.wave + 1 })),
    switchWeapon: (weapon) => set({ currentWeapon: weapon }),
    consumeAmmo: () => set((state) => {
        const weapon = state.currentWeapon
        if (state.ammo[weapon] === -1) return {}
        if (state.ammo[weapon] <= 0) return {}
        return {
            ammo: {
                ...state.ammo,
                [weapon]: state.ammo[weapon] - 1
            }
        }
    })
}))
