import { createFileRoute } from '@tanstack/react-router'
import { z } from "zod"
import { Input } from "@/components/ui/input"
const uploadSchema = z.object({
  name: z.string(),
  description: z.string(),
})
export const Route = createFileRoute('/video/upload')({
  component: RouteComponent,
})

function RouteComponent() {
  function handelSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement))
    const parse = uploadSchema.safeParse(data)
    if (parse.success) {
      console.log(parse.data)
    } else {
      console.error(parse.error)
    }
  }
  return <div>
    <form onSubmit={handelSubmit}>
      <Input type="text" placeholder="Email" />
      <input type="text" name='description' />
      <input type="file" name='file' />
      <button>Submit</button>

    </form>
  </div>
}
