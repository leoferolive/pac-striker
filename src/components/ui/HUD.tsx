'use client'

import { useGameStore } from '@/store/useGameStore'
import { WEAPONS } from '@/lib/constants'

export function HUD() {
    const { health, score, wave, currentWeapon, ammo, gameState } = useGameStore()

    if (gameState !== 'playing') return null

    const weapon = WEAPONS[currentWeapon]
    const currentAmmo = ammo[currentWeapon]
    const ammoDisplay = currentAmmo === -1 ? '∞' : currentAmmo

    return (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between text-white font-mono">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                        HP: {Math.ceil(health)}%
                    </div>
                    <div className="text-xl text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]">
                        WAVE: {wave}
                    </div>
                </div>
                <div className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                    SCORE: {score}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-400">WEAPON</div>
                    <div className="text-3xl font-bold" style={{ color: '#' + weapon.color.toString(16) }}>
                        {weapon.name}
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <div className="text-sm text-gray-400">AMMO</div>
                    <div className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {ammoDisplay}
                    </div>
                </div>
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/50 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
        </div>
    )
}
