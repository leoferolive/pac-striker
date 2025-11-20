# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a 3D Pac-Man-style game built with Next.js, React Three Fiber, and Three.js. The game features a top-down arena view where players navigate through a maze-like environment, shoot enemies, and survive waves of increasing difficulty.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Core Game Structure
The game follows a component-based architecture with clear separation of concerns:

**Main Components:**
- `src/app/page.tsx` - Main page combining HUD and 3D scene
- `src/components/canvas/Scene.tsx` - Three.js canvas setup with lighting and camera
- `src/components/canvas/GameManager.tsx` - Central game logic, entity management, and collision detection
- `src/components/ui/HUD.tsx` - 2D UI overlay for score, health, wave info

**Game Entities:**
- `src/components/canvas/Player.tsx` - Player character with movement and shooting
- `src/components/canvas/Enemy.tsx` - Enemy entities with AI behavior
- `src/components/canvas/Bullet.tsx` - Projectile entities
- `src/components/canvas/Arena.tsx` - Game environment/maze

### State Management
- Uses Zustand for global game state (`src/store/useGameStore.ts`)
- Game states: 'menu', 'playing', 'gameover'
- Tracks: score, health, wave number

### Game Systems
- **Physics & Collision**: `src/lib/physics.ts` - Grid-based collision detection, world/grid coordinate conversion
- **Controls**: `src/hooks/useControls.ts` - WASD movement + spacebar shooting
- **Constants**: `src/lib/constants.ts` - Game configuration (map layout, tile size, etc.)
- **Textures**: `src/hooks/useGridTexture.ts` - Dynamic texture generation

### Technical Stack
- **Framework**: Next.js 16 with App Router
- **3D Graphics**: React Three Fiber + Three.js + Drei
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **TypeScript**: Strict mode enabled with path aliases (`@/` for `src/`)

### Game Mechanics
- Top-down view with fixed camera at position [0, 40, 0]
- Grid-based movement system with collision detection
- Wave-based enemy spawning (5 enemies per wave)
- Bullet-enemy collision system
- Health and scoring system

### Development Notes
- Uses TypeScript path aliases: `@/` maps to `src/`
- ESLint configured with Next.js rules
- All game entities use React.forwardRef for proper Three.js object references
- Game loop managed through React Three Fiber's useFrame hook
- Collision detection uses AABB (Axis-Aligned Bounding Box) for walls and distance-based for entities