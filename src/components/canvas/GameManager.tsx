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
    const debugTimer = useRef(0)
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

    // Handle ESC key for pausing and P for debug spawn
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

            // Debug: Force Spawn Enemy
            if (e.key === 'p' || e.key === 'P') {
                const id = Math.random().toString(36).substr(2, 9)
                const spawnVec = new Vector3(5, 0, 5)
                console.log('🛑 FORCE SPAWNING ENEMY:', id, 'at', spawnVec)
                setEnemies(prev => {
                    const newEnemies = [...prev, { id, position: spawnVec }]
                    console.log('Current Enemies:', newEnemies)
                    return newEnemies
                })
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, pauseGame, resumeGame])

    useFrame((state, delta) => {
        // Debug Heartbeat
        debugTimer.current += delta
        if (debugTimer.current > 1.0) {
            console.log(
                '❤️ Heartbeat - State:', gameState,
                'SpawnTimer:', spawnTimer.current.toFixed(2),
                'Enemies:', enemies.length,
                'Bullets:', bullets.length,
                'PlayerPos:', playerPos.current
            )
            debugTimer.current = 0
        }

        // Only run game logic when playing
        if (gameState !== 'playing') return

        // Spawn Enemies
        spawnTimer.current += delta
        if (spawnTimer.current > 2.0 && enemies.length < wave * 5) {
            let spawned = false;
            let attempts = 0;

            // Try multiple times to find a valid spawn position in this frame
            while (!spawned && attempts < 10) {
                const spawn = getSafeSpawn()
                const spawnVec = new Vector3(spawn.x, 0, spawn.z)

                // Ensure spawn is far from player
                const distToPlayer = spawnVec.distanceTo(playerPos.current)
                if (distToPlayer > 10) {
                    const id = Math.random().toString(36).substr(2, 9)
                    console.log('👹 Spawning enemy:', id, 'at', spawnVec, 'Dist to player:', distToPlayer)
                    setEnemies(prev => [...prev, { id, position: spawnVec }])
                    spawned = true;
                } else {
                    // console.log('⚠️ Spawn too close:', distToPlayer)
                }
                attempts++;
            }

            if (spawned) {
                spawnTimer.current = 0 // Reset timer only if successful
            } else {
                spawnTimer.current = 1.8 // Retry sooner
            }
        }

        // Player-Enemy Collision Detection (Proximity damage)
        damageTimer.current += delta
        if (damageTimer.current > 0.5) { // Damage every 0.5 seconds when close
            for (const [_eId, eMesh] of Object.entries(enemyRefs.current)) {
                if (!eMesh || !playerRef.current) continue

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
            }
        }

        // Enemy shooting logic
        for (const [eId, eMesh] of Object.entries(enemyRefs.current)) {
            if (!eMesh || !playerRef.current) continue

            const dist = eMesh.position.distanceTo(playerRef.current.position)
            if (dist < 15 && Math.random() < 0.003) { // Random shooting when player is near
                const direction = new Vector3()
                    .subVectors(playerRef.current.position, eMesh.position)
                    .normalize()
                spawnEnemyBullet(eMesh.position.clone(), direction)
            }
        }

        // Player Bullet-Enemy Collision Detection
        // Use for...of to allow breaking
        const bulletsToRemove: string[] = []
        const enemiesToRemove: string[] = []

        for (const [bId, bMesh] of Object.entries(bulletRefs.current)) {
            if (!bMesh) continue
            let bulletHit = false

            for (const [eId, eMesh] of Object.entries(enemyRefs.current)) {
                if (!eMesh || enemiesToRemove.includes(eId)) continue

                const dist = bMesh.position.distanceTo(eMesh.position)

                // Debug log for the first bullet and first enemy to avoid spam
                if (bId === Object.keys(bulletRefs.current)[0] && eId === Object.keys(enemyRefs.current)[0] && Math.random() < 0.05) {
                    console.log(`📏 Distance Check - Bullet ${bId.substr(0, 4)} vs Enemy ${eId.substr(0, 4)}: ${dist.toFixed(2)}`)
                }

                if (dist < 2.5) { // Increased collision radius slightly
                    console.log('🎯 COLLISION DETECTED! Bullet:', bId, 'Enemy:', eId, 'Dist:', dist)
                    bulletsToRemove.push(bId)
                    enemiesToRemove.push(eId)
                    addScore(100)
                    bulletHit = true
                    break // Bullet hit something, stop checking other enemies for this bullet
                }
            }
            if (bulletHit) continue // Move to next bullet
        }

        // Apply removals
        if (bulletsToRemove.length > 0) {
            setBullets(prev => prev.filter(b => !bulletsToRemove.includes(b.id)))
            bulletsToRemove.forEach(id => delete bulletRefs.current[id])
        }
        if (enemiesToRemove.length > 0) {
            setEnemies(prev => prev.filter(e => !enemiesToRemove.includes(e.id)))
            enemiesToRemove.forEach(id => delete enemyRefs.current[id])
        }

        // Enemy Bullet-Player Collision Detection
        for (const [bId, bMesh] of Object.entries(enemyBulletRefs.current)) {
            if (!bMesh || !playerRef.current) continue

            const dist = bMesh.position.distanceTo(playerRef.current.position)
            if (dist < 1.2) { // Player radius + Bullet radius
                removeEnemyBullet(bId)
                const damageAmount = 15 + Math.random() * 15
                takeDamage(damageAmount) // Random damage 15-30

                // Check if player dies after taking damage
                if (getHealth - damageAmount <= 0) {
                    endGame()
                }
            }
        }
    })

    console.log('🖼️ GameManager Render. Enemies count:', enemies.length)

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
