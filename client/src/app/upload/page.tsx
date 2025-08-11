"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

import { FilePlay } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { useRef, useState } from "react";
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';

import axios from "axios";
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

type UploadFormValues = z.infer<typeof formSchema>;

export function UploadInput({
  form,
}: {
  form: ReturnType<typeof useForm<UploadFormValues>>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    // Create blob URL preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setMimeType(file.type);

    // Upload file with progress
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgress(0);

    try {
      await axios.post("/api/upload", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        },
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="w-150 border relative rounded-lg border-dashed p-5 flex gap-2 flex-col items-center justify-center cursor-pointer overflow-hidden">
      <FilePlay />
      <p className="text-muted-foreground">Drag and drop video to upload</p>

      <FormField
        control={form.control}
        name="video"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <input
                type="file"
                accept="video/*"
                className="w-full h-full absolute opacity-0"
                aria-label="Upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file);
                  handleFileChange(file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {preview && (
        <div className="mt-3 w-full flex justify-center">
          {/* <MediaPlayer title="Video Preview" src={ src={preview} type={mimeType || "video/mp4"} }>
            <MediaProvider>
              
            </MediaProvider>
          </MediaPlayer> */}
          <MediaPlayer controls title="Sprite Fight" src={{ src: preview, type: mimeType || "video/mp4" }} >
            <MediaProvider />
            <DefaultAudioLayout icons={defaultLayoutIcons} />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        </div>
      )}

      {uploading && (
        <div className="w-full mt-3">
          <Progress value={progress} />
          <p className="text-xs text-center mt-1">{progress}%</p>
        </div>
      )}
    </label>
  );
}


export default function Home() {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      thumbnail: "",
      video: undefined as unknown as File, // or use `undefined` and cast as needed
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
                  <Input className="w-100" placeholder="Title" {...field} />
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
                  <Textarea className="w-100" placeholder="Description" {...field} />
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
