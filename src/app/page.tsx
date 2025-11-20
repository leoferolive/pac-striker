import Scene from '@/components/canvas/Scene'
import { GameOverlay } from '@/components/ui/GameOverlay'

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black relative">
      <GameOverlay />
      <Scene />
    </main>
  )
}
