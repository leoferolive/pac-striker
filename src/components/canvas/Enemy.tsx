import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh } from 'three'
import { resolveCollision } from '@/lib/physics'

interface EnemyProps {
    position: Vector3
    targetPosition: React.MutableRefObject<Vector3>
}

export const Enemy = forwardRef<Mesh, EnemyProps>(({ position, targetPosition }, ref) => {
    const localRef = useRef<Mesh>(null)
    useImperativeHandle(ref, () => localRef.current!)

    const velocity = useRef(new Vector3(0, 0, 0))

    useFrame(() => {
        if (!localRef.current) return

        const pos = localRef.current.position

        // Seek
        const desired = new Vector3().subVectors(targetPosition.current, pos)
        desired.y = 0
        desired.normalize().multiplyScalar(0.1) // Max speed

        const steer = new Vector3().subVectors(desired, velocity.current)
        steer.multiplyScalar(0.1) // Turn speed

        velocity.current.add(steer)
        velocity.current.clampLength(0, 0.1)

        pos.add(velocity.current)

        // Collision with walls
        resolveCollision(pos, 0.9)

        // Rotate
        localRef.current.rotation.x += 0.05
        localRef.current.rotation.y += 0.1
    })

    return (
        <mesh ref={localRef} position={position} castShadow>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
    )
})
Enemy.displayName = 'Enemy'
