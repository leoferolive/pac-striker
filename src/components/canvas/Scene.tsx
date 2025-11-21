'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { GameManager } from './GameManager'
import * as THREE from 'three'

import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Scene() {
    return (
        <div className="h-screen w-full bg-black">
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    toneMapping: THREE.ReinhardToneMapping,
                    toneMappingExposure: 1.5,
                    antialias: true
                }}
            >
                <PerspectiveCamera makeDefault position={[0, 60, 0]} fov={75} onUpdate={(c) => c.lookAt(0, 0, 0)} />

                {/* Legacy-style Lighting */}
                <ambientLight intensity={0.6} color="#111122" />
                <directionalLight
                    position={[-20, 50, -20]}
                    intensity={2}
                    color="#aaccff"
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />
                {/* Fill light */}
                <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffaa00" />

                <Suspense fallback={null}>
                    <GameManager />
                </Suspense>

                <EffectComposer>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                </EffectComposer>

                {/* <OrbitControls /> */}
            </Canvas>
        </div>
    )
}
