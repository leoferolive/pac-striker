import { useMemo } from 'react'
import * as THREE from 'three'
import { useGridTexture } from '@/hooks/useGridTexture'
import { MAP_LAYOUT, TILE_SIZE, WALL_HEIGHT, MAP_COLS, MAP_ROWS } from '@/lib/constants'

// Helper to convert grid to world coordinates
const gridToWorld = (c: number, r: number) => ({
    x: (c * TILE_SIZE) - (MAP_COLS * TILE_SIZE / 2) + (TILE_SIZE / 2),
    z: (r * TILE_SIZE) - (MAP_ROWS * TILE_SIZE / 2) + (TILE_SIZE / 2)
})

interface ArenaProps {
    mapLayout: number[][]
}

export function Arena({ mapLayout }: ArenaProps) {
    const floorTex = useGridTexture()

    const walls = useMemo(() => {
        const w = []
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                if (mapLayout[r] && mapLayout[r][c] === 1) {
                    const pos = gridToWorld(c, r)
                    w.push({ x: pos.x, z: pos.z, key: `${r}-${c}` })
                }
            }
        }
        return w
    }, [mapLayout])

    const wallGeo = useMemo(() => new THREE.BoxGeometry(TILE_SIZE, WALL_HEIGHT, TILE_SIZE), [])
    const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.8 }), [])
    const edgesGeo = useMemo(() => new THREE.EdgesGeometry(wallGeo), [wallGeo])
    const edgesMat = useMemo(() => new THREE.LineBasicMaterial({ color: 0x00eebb }), [])

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE]} />
                <meshStandardMaterial map={floorTex} roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Walls */}
            {walls.map(wall => (
                <group key={wall.key} position={[wall.x, WALL_HEIGHT / 2, wall.z]}>
                    <mesh geometry={wallGeo} material={wallMat} castShadow receiveShadow />
                    <lineSegments geometry={edgesGeo} material={edgesMat} />
                </group>
            ))}
        </group>
    )
}
