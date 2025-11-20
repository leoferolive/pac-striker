import { useRef, useLayoutEffect, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Group, Raycaster, Plane, Object3D, SpotLight, Euler } from 'three'
import { useControls } from '@/hooks/useControls'
import { resolveCollision, getSafeSpawn } from '@/lib/physics'
import { useGameStore } from '@/store/useGameStore'

interface PlayerProps {
    onShoot?: (pos: Vector3, rot: Euler, color: number | string) => void
    positionRef?: React.MutableRefObject<Vector3>
}

export const Player = forwardRef<Group, PlayerProps>(({ onShoot, positionRef }, ref) => {
    const meshRef = useRef<Group>(null)
    useImperativeHandle(ref, () => meshRef.current!)
    const lightRef = useRef<SpotLight>(null)
    const [targetObject] = useState(() => new Object3D())

    const { w, a, s, d } = useControls()
    const { camera, pointer } = useThree()
    const raycaster = useRef(new Raycaster())
    const aimPlane = useRef(new Plane(new Vector3(0, 1, 0), -1.2)) // Plane at y=1.2 facing up

    // Velocity ref to avoid re-renders
    const velocity = useRef(new Vector3(0, 0, 0))
    const cooldown = useRef(0)
    const [mousePressed, setMousePressed] = useState(false)

    // Initialize spawn position
    useLayoutEffect(() => {
        const spawn = getSafeSpawn()
        if (meshRef.current) {
            meshRef.current.position.set(spawn.x, 0, spawn.z)
        }
        // Link light target
        if (lightRef.current) {
            lightRef.current.target = targetObject
        }
    }, [targetObject])

    // Mouse event handlers
    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (event.button === 0) { // Left mouse button
                setMousePressed(true)
            }
        }

        const handleMouseUp = (event: MouseEvent) => {
            if (event.button === 0) { // Left mouse button
                setMousePressed(false)
            }
        }

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const { gameState } = useGameStore()

    useFrame((_state, _delta) => {
        if (!meshRef.current) return

        // Only allow movement and actions if playing
        if (gameState !== 'playing') return

        // Movement
        const v = velocity.current
        const accel = 0.04 // Fixed acceleration per frame roughly

        if (w) v.z -= accel
        if (s) v.z += accel
        if (a) v.x -= accel
        if (d) v.x += accel

        v.multiplyScalar(0.85) // Friction

        // Apply velocity
        meshRef.current.position.add(v)

        // Collision
        resolveCollision(meshRef.current.position, 0.8)

        if (positionRef) positionRef.current.copy(meshRef.current.position)

        // Aiming
        raycaster.current.setFromCamera(pointer, camera)
        const target = new Vector3()
        raycaster.current.ray.intersectPlane(aimPlane.current, target)

        if (target) {
            meshRef.current.lookAt(target.x, meshRef.current.position.y, target.z)
        }

        // Shooting
        if (cooldown.current > 0) cooldown.current--
        if (mousePressed && cooldown.current <= 0 && onShoot) {
            // Spawn bullet at gun position
            // Gun is at 0, 1.2, 0.6 relative to player
            const gunPos = new Vector3(0, 1.2, 0.6)
            gunPos.applyMatrix4(meshRef.current.matrixWorld)

            onShoot(gunPos, meshRef.current.rotation.clone(), 0xfbbf24)
            cooldown.current = 15 // Delay
        }
    })

    return (
        <group ref={meshRef}>
            {/* Body */}
            <mesh castShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[1.4, 1.0, 1.4]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Turret */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.5, 0.6, 0.5, 8]} />
                <meshStandardMaterial color="#333" roughness={0.7} />
            </mesh>
            {/* Gun */}
            <mesh position={[0, 1.2, 0.6]}>
                <boxGeometry args={[0.2, 0.2, 1.5]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            {/* Light */}
            <spotLight
                ref={lightRef}
                position={[0, 1.5, 0]}
                angle={0.5}
                penumbra={0.5}
                intensity={2}
                castShadow
            />
            <primitive object={targetObject} position={[0, 1.5, 10]} />
        </group>
    )
})
Player.displayName = 'Player'
