import { useState, useCallback, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Euler, Object3D } from 'three'
import { Player } from './Player'
import { Arena } from './Arena'
import { Bullet } from './Bullet'
import { Enemy } from './Enemy'
import { getSafeSpawn } from '@/lib/physics'
import { useGameStore } from '@/store/useGameStore'
import { generateMap } from '@/lib/mapGenerator'
import { MAP_ROWS, MAP_COLS } from '@/lib/constants'

interface BulletData {
    id: string
    position: Vector3
    rotation: Euler
    color: number | string
    damage: number
}

interface EnemyData {
    id: string
    position: Vector3
    health: number
}

export function GameManager() {
    const [bullets, setBullets] = useState<BulletData[]>([])
    const [enemies, setEnemies] = useState<EnemyData[]>([])
    const [mapLayout, setMapLayout] = useState<number[][]>([])

    const playerPos = useRef(new Vector3())
    const enemyRefs = useRef<{ [key: string]: Object3D }>({})
    const bulletRefs = useRef<{ [key: string]: Object3D }>({})

    const addScore = useGameStore(state => state.addScore)
    const wave = useGameStore(state => state.wave)
    const takeDamage = useGameStore(state => state.takeDamage)
    const endGame = useGameStore(state => state.endGame)
    const pauseGame = useGameStore(state => state.pauseGame)
    const resumeGame = useGameStore(state => state.resumeGame)
    const gameState = useGameStore(state => state.gameState)
    const getHealth = useGameStore(state => state.health)

    const spawnTimer = useRef(2.0)
    const damageTimer = useRef(0)
    const debugTimer = useRef(0)
    const playerRef = useRef<Object3D>(null!)
    const [enemyBullets, setEnemyBullets] = useState<BulletData[]>([])
    const enemyBulletRefs = useRef<{ [key: string]: Object3D }>({})

    // Generate map on mount or restart
    useEffect(() => {
        const layout = generateMap(MAP_ROWS, MAP_COLS)
        setMapLayout(layout)
    }, [])

    const spawnBullet = useCallback((position: Vector3, rotation: Euler, color: number | string, damage: number) => {
        const id = Math.random().toString(36).substr(2, 9)
        setBullets(prev => [...prev, { id, position, rotation, color, damage }])
    }, [])

    const removeBullet = useCallback((id: string) => {
        setBullets(prev => prev.filter(b => b.id !== id))
        delete bulletRefs.current[id]
    }, [])

    const removeEnemy = useCallback((id: string) => {
        setEnemies(prev => prev.filter(e => e.id !== id))
        delete enemyRefs.current[id]
    }, [])

    const spawnEnemyBullet = useCallback((position: Vector3, direction: Vector3) => {
        const id = Math.random().toString(36).substr(2, 9)
        const rotation = new Euler(0, Math.atan2(direction.x, direction.z), 0)
        setEnemyBullets(prev => [...prev, { id, position: position.clone(), rotation, color: "#ff6600", damage: 10 }])
    }, [])

    const removeEnemyBullet = useCallback((id: string) => {
        setEnemyBullets(prev => prev.filter(b => b.id !== id))
        delete enemyBulletRefs.current[id]
    }, [])

    // Handle ESC key for pausing and P for debug spawn
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (gameState === 'playing') {
                    pauseGame()
                } else if (gameState === 'paused') {
                    resumeGame()
                }
            }

            // Debug: Force Spawn Enemy
            if (e.key === 'p' || e.key === 'P') {
                const id = Math.random().toString(36).substr(2, 9)
                const spawnVec = new Vector3(5, 0, 5)
                setEnemies(prev => [...prev, { id, position: spawnVec, health: 50 }])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, pauseGame, resumeGame])

    useFrame((state, delta) => {
        // Debug Heartbeat
        debugTimer.current += delta
        if (debugTimer.current > 1.0) {
            debugTimer.current = 0
        }

        // Only run game logic when playing
        if (gameState !== 'playing') return

        // Spawn Enemies
        spawnTimer.current += delta
        if (spawnTimer.current > 2.0 && enemies.length < wave * 5 && mapLayout.length > 0) {
            let spawned = false;
            let attempts = 0;

            // Try multiple times to find a valid spawn position in this frame
            while (!spawned && attempts < 10) {
                const spawn = getSafeSpawn(mapLayout)
                const spawnVec = new Vector3(spawn.x, 0, spawn.z)

                // Ensure spawn is far from player
                const distToPlayer = spawnVec.distanceTo(playerPos.current)
                if (distToPlayer > 10) {
                    const id = Math.random().toString(36).substr(2, 9)
                    const health = 30 + (wave * 10)
                    setEnemies(prev => [...prev, { id, position: spawnVec, health }])
                    spawned = true;
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
        const bulletsToRemove: string[] = []
        const enemiesToRemove: string[] = []
        const enemiesHit: { [id: string]: number } = {} // Track damage per enemy

        for (const [bId, bMesh] of Object.entries(bulletRefs.current)) {
            if (!bMesh) continue
            let bulletHit = false
            const bulletData = bullets.find(b => b.id === bId)
            if (!bulletData) continue

            for (const [eId, eMesh] of Object.entries(enemyRefs.current)) {
                if (!eMesh || enemiesToRemove.includes(eId)) continue

                const dist = bMesh.position.distanceTo(eMesh.position)

                if (dist < 2.5) { // Collision
                    bulletsToRemove.push(bId)

                    // Record damage
                    enemiesHit[eId] = (enemiesHit[eId] || 0) + bulletData.damage

                    bulletHit = true
                    break
                }
            }
            if (bulletHit) continue
        }

        // Apply damage to enemies
        if (Object.keys(enemiesHit).length > 0) {
            setEnemies(prev => prev.map(e => {
                if (enemiesHit[e.id]) {
                    const newHealth = e.health - enemiesHit[e.id]
                    if (newHealth <= 0) {
                        enemiesToRemove.push(e.id)
                        addScore(100)
                        return { ...e, health: 0 } // Mark for removal
                    }
                    return { ...e, health: newHealth }
                }
                return e
            }).filter(e => !enemiesToRemove.includes(e.id)))
        }

        // Apply removals
        if (bulletsToRemove.length > 0) {
            setBullets(prev => prev.filter(b => !bulletsToRemove.includes(b.id)))
            bulletsToRemove.forEach(id => delete bulletRefs.current[id])
        }
        if (enemiesToRemove.length > 0) {
            // setEnemies already filtered above, but we need to clean refs
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

    return (
        <>
            {mapLayout.length > 0 && <Arena mapLayout={mapLayout} />}
            {mapLayout.length > 0 && (
                <Player
                    onShoot={spawnBullet}
                    positionRef={playerPos}
                    ref={(el) => { if (el) playerRef.current = el }}
                    mapLayout={mapLayout}
                />
            )}

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
