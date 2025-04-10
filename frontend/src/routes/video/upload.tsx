import { createFileRoute } from '@tanstack/react-router'
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, FileText, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from '@/utils/api'
import type { AxiosProgressEvent } from 'axios'

export const Route = createFileRoute('/video/upload')({
  component: RouteComponent,
})

function RouteComponent() {
return  <FileUploadForm />
}




function FileUploadForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    // Create preview for image files
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const uploadFileWithProgress = (formData: FormData) => {
    return api.post("/videos", formData, {
      onUploadProgress: (event: AxiosProgressEvent) => {
        const percentComplete = Math.floor((event.loaded / event.total) * 100)
        setUploadProgress(percentComplete)
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Create FormData object to send file
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("file", file)
   
      console.log(await uploadFileWithProgress(formData))

      alert("File uploaded successfully!")
      setName("")
      setDescription("")
      setFile(null)
      setPreview(null)
      setUploadProgress(0)
    } catch (err) {
      setError("Failed to upload file. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>Fill in the details and upload your file</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter file name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md border">
                <img src={preview || "/placeholder.svg"} alt="File preview" className="object-contain w-full h-full" />
              </div>
            </div>
          )}

          {file && !preview && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          )}
          {isSubmitting && (
            <div className="px-6 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

