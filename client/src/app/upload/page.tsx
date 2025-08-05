"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

import { FilePlay } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  tags: z.string().optional(),
  thumbnail: z.string().optional(),
  video: z.instanceof(File).refine(file => file.size > 0, {
    message: "Please upload a video file.",
  }),
})

export function UploadInput({ form }: { form: ReturnType<typeof useForm> }) {
  return (
    <label className="w-100 h-60 border relative rounded-lg border-dashed p-5 flex gap-2 flex-col items-center justify-center cursor-pointer">
      <FilePlay />
      <p className="text-muted-foreground">Drag and drop video to upload</p>
      <FormField
        control={form.control}
        name="video"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <input type="file" className="w-full h-full absolute opacity-0" aria-label="Upload" {...field} />

            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </label>
  )
}




export default function Home() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      thumbnail: "",
      video: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold">
        Upload Video
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <UploadInput form={form} />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormDescription>
                  Title of the video.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormDescription>
                  Description of the video.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Upload</Button>
        </form>
      </Form>
    </div>
  );
}
