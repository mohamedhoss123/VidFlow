import { createFileRoute } from '@tanstack/react-router'
import { FileUploadForm } from "@/components/file-upload-form"

export const Route = createFileRoute('/video/upload')({
  component: RouteComponent,
})

function RouteComponent() {
return  <FileUploadForm />
}
