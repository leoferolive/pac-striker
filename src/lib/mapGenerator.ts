import { MAP_COLS, MAP_ROWS } from './constants'

export const generateMap = (rows: number = MAP_ROWS, cols: number = MAP_COLS): number[][] => {
    // Initialize with walls
    const map = Array(rows).fill(0).map(() => Array(cols).fill(1))

    // Random Walk Algorithm
    let x = Math.floor(cols / 2)
    let y = Math.floor(rows / 2)
    const maxSteps = Math.floor(rows * cols * 0.6) // Cover ~60% of the map

    map[y][x] = 0 // Start point

    for (let i = 0; i < maxSteps; i++) {
        const direction = Math.floor(Math.random() * 4)

        // 0: Up, 1: Right, 2: Down, 3: Left
        switch (direction) {
            case 0: if (y > 1) y--; break;
            case 1: if (x < cols - 2) x++; break;
            case 2: if (y < rows - 2) y++; break;
            case 3: if (x > 1) x--; break;
        }

        map[y][x] = 0

        // Make corridors wider occasionally
        if (Math.random() < 0.3) {
            if (y > 1 && y < rows - 2 && x > 1 && x < cols - 2) {
                map[y + 1][x] = 0
                map[y - 1][x] = 0
                map[y][x + 1] = 0
                map[y][x - 1] = 0
            }
        }
    }

    // Ensure borders are walls
    for (let r = 0; r < rows; r++) {
        map[r][0] = 1
        map[r][cols - 1] = 1
    }
    for (let c = 0; c < cols; c++) {
        map[0][c] = 1
        map[rows - 1][c] = 1
    }

    return map
}
