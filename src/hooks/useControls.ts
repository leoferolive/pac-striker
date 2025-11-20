import { useState, useEffect } from 'react'

export function useControls() {
    const [input, setInput] = useState({ w: false, a: false, s: false, d: false })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'w': setInput(i => ({ ...i, w: true })); break
                case 'a': setInput(i => ({ ...i, a: true })); break
                case 's': setInput(i => ({ ...i, s: true })); break
                case 'd': setInput(i => ({ ...i, d: true })); break
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'w': setInput(i => ({ ...i, w: false })); break
                case 'a': setInput(i => ({ ...i, a: false })); break
                case 's': setInput(i => ({ ...i, s: false })); break
                case 'd': setInput(i => ({ ...i, d: false })); break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return input
}
