"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { FilePlay, X } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Player from "~/components/player";
import axiosInstance from "~/lib/api";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  thumbnail: z.string().optional(),
  video: z.instanceof(File).refine((file) => file.size > 0, {
    message: "Please upload a video file.",
  }),
});

type UploadFormValues = z.infer<typeof formSchema>;

function UploadInput({
  form,
}: {
  form: ReturnType<typeof useForm<UploadFormValues>>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = dropRef.current;
    if (!div) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("video/")) {
        form.setValue("video", file);
        handleFileSelect(file);
      }
    };

    div.addEventListener("dragenter", handleDragEnter);
    div.addEventListener("dragleave", handleDragLeave);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);

    return () => {
      div.removeEventListener("dragenter", handleDragEnter);
      div.removeEventListener("dragleave", handleDragLeave);
      div.removeEventListener("dragover", handleDragOver);
      div.removeEventListener("drop", handleDrop);
    };
  }, [form]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (file?: File) => {
    if (!file) return;

    // Clean up previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    form.setValue("video", undefined as unknown as File);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const currentFile = form.watch("video");

  return (
    <FormField
      control={form.control}
      name="video"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="sr-only">Video Upload</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {!preview ? (
                <div
                  ref={dropRef}
                  className={`w-full max-w-md border relative rounded-lg border-dashed p-8 flex gap-3 flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? "bg-muted border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <FilePlay className="w-12 h-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag and drop video to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="w-full h-full absolute opacity-0 cursor-pointer"
                    aria-label="Upload video"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        handleFileSelect(file);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-black max-w-md">
                    <video
                      src={preview}
                      controls
                      className="w-full h-auto max-h-64"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                      aria-label="Remove video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Info */}
                  {currentFile && (
                    <div className="bg-muted/50 rounded-lg p-3 max-w-md">
                      <p className="text-sm font-medium truncate">
                        {currentFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(currentFile.size)} • {currentFile.type}
                      </p>
                    </div>
                  )}

                  {/* Change File Button */}
                  <div className="relative max-w-md">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Change Video
                    </Button>
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Change video"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                          handleFileSelect(file);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      video: undefined as unknown as File,
    },
  });

  async function onSubmit(values: UploadFormValues) {
    console.log(values);

    if (!values.video) return;

    const formData = new FormData();
    formData.append("video", values.video);
    formData.append("name", values.title);
    formData.append("description", values.description);

    setUploading(true);
    setUploadProgress(0);
    console.log(formData);
    try {
      const response = await axiosInstance.post("/api/upload/video", formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
      // TODO: Handle successful upload (e.g., redirect, show success message, etc.)
    } catch (err) {
      console.error("Upload failed", err);
      // TODO: Handle upload error (e.g., show error message)
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Upload Video</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <UploadInput form={form} />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter video title" {...field} />
                </FormControl>
                <FormDescription>Title of the video.</FormDescription>
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
                  <Textarea
                    placeholder="Enter video description"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Description of the video.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !form.watch("video")}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
