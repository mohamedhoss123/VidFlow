import { createFileRoute } from '@tanstack/react-router'
import ReactPlayer from 'react-player'
export const Route = createFileRoute('/video/')({
  component: RouteComponent,
})

function RouteComponent() {
  const src = 'http://localhost:3000/videos/optimized-6363c919-cf61-4ac5-95f9-19f66ee5d85d.m3u8'
  return (
   <>
   <div>ww</div>
   <ReactPlayer url={src} controls={true} />
   </>
  )
}

