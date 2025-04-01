import { createFileRoute } from '@tanstack/react-router'
import { FileUploadForm } from "@/components/file-upload-form"
import { Navbar } from '@/components/navbar'

export const Route = createFileRoute('/video/upload')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="container mx-auto py-10 px-4">
    <Navbar/>
  <FileUploadForm />
</main>
}
