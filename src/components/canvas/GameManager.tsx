import { useState, useCallback, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Euler, Object3D } from 'three'
import { Player } from './Player'
import { Arena } from './Arena'
import { Bullet } from './Bullet'
import { Enemy } from './Enemy'
import { getSafeSpawn } from '@/lib/physics'
import { useGameStore } from '@/store/useGameStore'

interface BulletData {
    id: string
    position: Vector3
    rotation: Euler
    color: number | string
}

interface EnemyData {
    id: string
    position: Vector3
}

export function GameManager() {
    const [bullets, setBullets] = useState<BulletData[]>([])
    const [enemies, setEnemies] = useState<EnemyData[]>([])

    const playerPos = useRef(new Vector3())
    const enemyRefs = useRef<{ [key: string]: Object3D }>({})
    const bulletRefs = useRef<{ [key: string]: Object3D }>({})

    const { addScore, wave, takeDamage, endGame, pauseGame, resumeGame, gameState } = useGameStore()
    const getHealth = useGameStore(state => state.health)

    const spawnTimer = useRef(2.0)
    const damageTimer = useRef(0)
    const playerRef = useRef<Object3D>(null!)
    const [enemyBullets, setEnemyBullets] = useState<BulletData[]>([])
    const enemyBulletRefs = useRef<{ [key: string]: Object3D }>({})

    const spawnBullet = useCallback((position: Vector3, rotation: Euler, color: number | string) => {
        const id = Math.random().toString(36).substr(2, 9)
        setBullets(prev => [...prev, { id, position, rotation, color }])
    }, [])

    const removeBullet = useCallback((id: string) => {
        console.log('🗑️ Removing bullet:', id)
        setBullets(prev => prev.filter(b => b.id !== id))
        delete bulletRefs.current[id]
    }, [])

    const removeEnemy = useCallback((id: string) => {
        console.log('👹 Removing enemy:', id)
        setEnemies(prev => prev.filter(e => e.id !== id))
        delete enemyRefs.current[id]
    }, [])

    const spawnEnemyBullet = useCallback((position: Vector3, direction: Vector3) => {
        const id = Math.random().toString(36).substr(2, 9)
        const rotation = new Euler(0, Math.atan2(direction.x, direction.z), 0)
        setEnemyBullets(prev => [...prev, { id, position: position.clone(), rotation, color: "#ff6600" }])
    }, [])

    const removeEnemyBullet = useCallback((id: string) => {
        setEnemyBullets(prev => prev.filter(b => b.id !== id))
        delete enemyBulletRefs.current[id]
    }, [])

    // Handle ESC key for pausing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log('⌨️ Key pressed:', e.key, 'Current State:', gameState)
            if (e.key === 'Escape') {
                if (gameState === 'playing') {
                    console.log('⏸️ Pausing game...')
                    pauseGame()
                } else if (gameState === 'paused') {
                    console.log('▶️ Resuming game...')
                    resumeGame()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, pauseGame, resumeGame])

    useFrame((state, delta) => {
        // Only run game logic when playing
        if (gameState !== 'playing') return

        // Spawn Enemies
        spawnTimer.current += delta
        if (spawnTimer.current > 2.0 && enemies.length < wave * 5) {
            let spawned = false;
            let attempts = 0;

            // Try multiple times to find a valid spawn position in this frame
            while (!spawned && attempts < 5) {
                const spawn = getSafeSpawn()
                const spawnVec = new Vector3(spawn.x, 0, spawn.z)

                // Ensure spawn is far from player
                if (spawnVec.distanceTo(playerPos.current) > 10) {
                    const id = Math.random().toString(36).substr(2, 9)
                    console.log('👹 Spawning enemy:', id, 'at', spawnVec)
                    setEnemies(prev => [...prev, { id, position: spawnVec }])
                    spawned = true;
                }
                attempts++;
            }

            if (spawned) {
                spawnTimer.current = 0 // Reset timer only if successful
            } else {
                // If failed, maybe reduce timer slightly to retry sooner, or just keep it > 2.0 to retry next frame
                // For now, let's just leave it > 2.0 so it retries next frame immediately
                // But to avoid infinite loop if map is full, we should probably reset it occasionally or have a limit
                // Let's just reset it to 1.5 so it retries in 0.5s instead of immediately spamming
                spawnTimer.current = 1.5
                console.log('⚠️ Could not find valid enemy spawn position (too close to player)')
            }
        }

        // Player-Enemy Collision Detection (Proximity damage)
        damageTimer.current += delta
        if (damageTimer.current > 0.5) { // Damage every 0.5 seconds when close
            Object.entries(enemyRefs.current).forEach(([_eId, eMesh]) => {
                if (!eMesh || !playerRef.current) return

                const dist = eMesh.position.distanceTo(playerRef.current.position)
                if (dist < 2.0) { // Enemy proximity damage radius
                    const damageAmount = 10 + Math.random() * 10
                    takeDamage(damageAmount) // Random damage 10-20
                    damageTimer.current = 0

                    // Check if player dies after taking damage
                    if (getHealth - damageAmount <= 0) {
                        endGame()
                    }
                }
            })
        }

        // Enemy shooting logic
        Object.entries(enemyRefs.current).forEach(([eId, eMesh]) => {
            if (!eMesh || !playerRef.current) return

            const dist = eMesh.position.distanceTo(playerRef.current.position)
            if (dist < 15 && Math.random() < 0.003) { // Random shooting when player is near
                const direction = new Vector3()
                    .subVectors(playerRef.current.position, eMesh.position)
                    .normalize()
                spawnEnemyBullet(eMesh.position.clone(), direction)
            }
        })

        // Player Bullet-Enemy Collision Detection
        Object.entries(bulletRefs.current).forEach(([bId, bMesh]) => {
            if (!bMesh) return

            Object.entries(enemyRefs.current).forEach(([eId, eMesh]) => {
                if (!eMesh) return

                const dist = bMesh.position.distanceTo(eMesh.position)
                if (dist < 2.0) { // Increased collision distance for testing
                    console.log('🎯 COLLISION DETECTED! Distance:', dist)
                    removeBullet(bId)
                    removeEnemy(eId)
                    addScore(100)
                    return // Exit both loops after hit
                }
            })
        })

        // Enemy Bullet-Player Collision Detection
        Object.entries(enemyBulletRefs.current).forEach(([bId, bMesh]) => {
            if (!bMesh || !playerRef.current) return

            const dist = bMesh.position.distanceTo(playerRef.current.position)
            if (dist < 1.0 + 0.1) { // Player radius + Bullet radius
                removeEnemyBullet(bId)
                const damageAmount = 15 + Math.random() * 15
                takeDamage(damageAmount) // Random damage 15-30

                // Check if player dies after taking damage
                if (getHealth - damageAmount <= 0) {
                    endGame()
                }
            }
        })
    })

    return (
        <>
            <Arena />
            <Player
                onShoot={spawnBullet}
                positionRef={playerPos}
                ref={(el) => { if (el) playerRef.current = el }}
            />

            {bullets.map(b => (
                <Bullet
                    key={b.id}
                    ref={(el) => { if (el) bulletRefs.current[b.id] = el }}
                    position={b.position}
                    rotation={b.rotation}
                    color={b.color}
                    onHit={() => removeBullet(b.id)}
                />
            ))}

            {enemies.map(e => (
                <Enemy
                    key={e.id}
                    ref={(el) => { if (el) enemyRefs.current[e.id] = el }}
                    position={e.position}
                    targetPosition={playerPos}
                />
            ))}

            {enemyBullets.map(b => (
                <Bullet
                    key={b.id}
                    ref={(el) => { if (el) enemyBulletRefs.current[b.id] = el }}
                    position={b.position}
                    rotation={b.rotation}
                    color={b.color}
                    onHit={() => removeEnemyBullet(b.id)}
                />
            ))}
        </>
    )
}
