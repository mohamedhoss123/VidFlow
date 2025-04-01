import { Navbar } from '@/components/navbar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="container mx-auto py-10 px-4">
      <Navbar/>
    <Outlet/>
  </main>
}
