import { Navbar } from '@/components/navbar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/video')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="container mx-auto py-10 px-4">
      <Navbar/>
    <Outlet/>
  </main>
}
