'use client'

import { useGameStore } from '@/store/useGameStore'

export function HUD() {
    const { score, health, wave } = useGameStore()

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10 font-mono">
            <div className="flex justify-between items-start">
                {/* Health */}
                <div className="bg-black/80 border border-gray-800 border-l-4 border-l-green-500 p-2 px-6 transform -skew-x-12 shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                    <div className="text-xs text-gray-400 transform skew-x-12 tracking-widest">BLINDAGEM</div>
                    <div className="text-3xl font-bold text-green-500 transform skew-x-12">{health}%</div>
                </div>

                {/* Wave */}
                <div className="bg-black/80 border border-gray-800 border-r-4 border-r-purple-500 p-2 px-6 transform skew-x-12 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <div className="text-xs text-gray-400 transform -skew-x-12 text-right tracking-widest">ONDA</div>
                    <div className="text-3xl font-bold text-purple-500 transform -skew-x-12 text-right">{wave}</div>
                </div>
            </div>

            {/* Score */}
            <div className="self-center bg-black/80 border-b-4 border-yellow-500 p-2 px-12 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <div className="text-xs text-gray-400 text-center tracking-widest mb-1">PONTUAÇÃO</div>
                <div className="text-4xl font-bold text-white text-center tracking-tighter">{score}</div>
            </div>

            {/* Ammo/Weapon (Placeholder) */}
            <div className="self-end bg-black/80 border border-gray-800 border-r-4 border-r-yellow-500 p-2 px-6 transform skew-x-12 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                <div className="text-xs text-gray-400 transform -skew-x-12 text-right tracking-widest">SISTEMA</div>
                <div className="text-xl font-bold text-yellow-500 transform -skew-x-12 text-right">PISTOLA ∞</div>
            </div>
        </div>
    )
}
