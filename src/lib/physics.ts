import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants'

export function gridToWorld(c: number, r: number) {
    return {
        x: (c * TILE_SIZE) - (MAP_COLS * TILE_SIZE / 2) + (TILE_SIZE / 2),
        z: (r * TILE_SIZE) - (MAP_ROWS * TILE_SIZE / 2) + (TILE_SIZE / 2)
    };
}

export function worldToGrid(x: number, z: number) {
    let c = Math.floor((x + (MAP_COLS * TILE_SIZE / 2)) / TILE_SIZE);
    let r = Math.floor((z + (MAP_ROWS * TILE_SIZE / 2)) / TILE_SIZE);
    return { c, r };
}

export function resolveCollision(pos: { x: number, z: number }, radius: number, mapLayout: number[][]) {
    if (!mapLayout || mapLayout.length === 0) return;

    let centerGrid = worldToGrid(pos.x, pos.z);

    for (let r = centerGrid.r - 1; r <= centerGrid.r + 1; r++) {
        for (let c = centerGrid.c - 1; c <= centerGrid.c + 1; c++) {
            if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) continue;

            if (mapLayout[r]?.[c] === 1) {
                // Posição da parede (centro)
                let wallPos = gridToWorld(c, r);
                // Limites da parede (AABB)
                let minX = wallPos.x - TILE_SIZE / 2;
                let maxX = wallPos.x + TILE_SIZE / 2;
                let minZ = wallPos.z - TILE_SIZE / 2;
                let maxZ = wallPos.z + TILE_SIZE / 2;

                // Ponto mais próximo no retângulo da parede ao centro do círculo
                let closestX = Math.max(minX, Math.min(pos.x, maxX));
                let closestZ = Math.max(minZ, Math.min(pos.z, maxZ));

                // Distância
                let dx = pos.x - closestX;
                let dz = pos.z - closestZ;
                let distanceSq = dx * dx + dz * dz;

                if (distanceSq < radius * radius) {
                    // Colisão detectada, resolver
                    let distance = Math.sqrt(distanceSq);
                    let overlap = radius - distance;

                    // Vetor normalizado de empurrão
                    let nx = dx / distance;
                    let nz = dz / distance;

                    // Se distance for 0 (exatamente dentro), empurrar para longe arbitrariamente
                    if (distance === 0) { nx = 1; nz = 0; }

                    pos.x += nx * overlap;
                    pos.z += nz * overlap;
                }
            }
        }
    }
}

export function isSolid(x: number, z: number, mapLayout: number[][]) {
    if (!mapLayout) return true;
    let grid = worldToGrid(x, z);
    if (grid.c < 0 || grid.c >= MAP_COLS || grid.r < 0 || grid.r >= MAP_ROWS) return true;
    return mapLayout[grid.r]?.[grid.c] === 1;
}

export function getSafeSpawn(mapLayout: number[][]) {
    let safe = false;
    let pos = { x: 0, z: 0 };
    let attempts = 0;

    if (!mapLayout || mapLayout.length === 0) return pos;

    while (!safe && attempts < 100) {
        let c = Math.floor(Math.random() * (MAP_COLS - 2)) + 1;
        let r = Math.floor(Math.random() * (MAP_ROWS - 2)) + 1;
        if (mapLayout[r]?.[c] === 0) {
            let world = gridToWorld(c, r);
            pos.x = world.x;
            pos.z = world.z;
            safe = true;
        }
        attempts++;
    }

    if (!safe) {
        console.warn('⚠️ Failed to find safe spawn after 100 attempts');
    }

    return pos;
}
