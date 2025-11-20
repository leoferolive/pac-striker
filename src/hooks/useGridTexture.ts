import * as THREE from 'three'
import { useMemo } from 'react'
import { MAP_COLS, MAP_ROWS } from '@/lib/constants'

export function useGridTexture() {
    return useMemo(() => {
        if (typeof window === 'undefined') return new THREE.Texture()

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        // Fundo escuro
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 512, 512);

        // Grid Principal
        ctx.strokeStyle = '#004444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(512, 0);
        ctx.moveTo(0, 0); ctx.lineTo(0, 512);
        ctx.stroke();

        // Subgrid
        ctx.strokeStyle = '#002222';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            let off = i * (512 / 4);
            ctx.beginPath();
            ctx.moveTo(off, 0); ctx.lineTo(off, 512);
            ctx.moveTo(0, off); ctx.lineTo(512, off);
            ctx.stroke();
        }

        // Glow spots
        ctx.fillStyle = 'rgba(0, 188, 212, 0.1)';
        ctx.fillRect(10, 10, 100, 100);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(MAP_COLS, MAP_ROWS);

        return tex;
    }, [])
}
