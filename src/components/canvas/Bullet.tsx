import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Group, Euler } from 'three'
import { isSolid } from '@/lib/physics'

interface BulletProps {
    position: Vector3
    rotation: Euler
    color: number | string
    onHit: () => void
}

export const Bullet = forwardRef<Group, BulletProps>(({ position, rotation, color, onHit }, ref) => {
    const localRef = useRef<Group>(null)
    useImperativeHandle(ref, () => localRef.current!)

    // Speed 1.0 per frame roughly matches legacy
    const velocity = useRef(new Vector3(0, 0, 1).applyEuler(rotation).multiplyScalar(1.0))

    useFrame(() => {
        if (!localRef.current) return
        localRef.current.position.add(velocity.current)

        if (isSolid(localRef.current.position.x, localRef.current.position.z)) {
            onHit()
        }

        // Cleanup if too far
        if (localRef.current.position.length() > 100) {
            onHit()
        }
    })

    return (
        <group ref={localRef} position={position} rotation={rotation}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
            <pointLight color={color} intensity={1} distance={8} decay={2} />
        </group>
    )
})
Bullet.displayName = 'Bullet'
