import { useState } from "react"
import { Search, Filter, MoreVertical, Play, Edit, Trash2, Share2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"

// Mock data for videos
const mockVideos = [
  {
    id: "1",
    title: "Product Demo Video",
    description: "A detailed walkthrough of our new product features",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 3, 15),
    duration: "3:45",
    fileSize: "24.5 MB",
    fileType: "video/mp4",
  },
  {
    id: "2",
    title: "Company Overview",
    description: "An introduction to our company and our mission",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 2, 28),
    duration: "5:12",
    fileSize: "42.1 MB",
    fileType: "video/mp4",
  },
  {
    id: "3",
    title: "Tutorial: Getting Started",
    description: "Learn how to get started with our platform",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 4, 5),
    duration: "8:30",
    fileSize: "67.8 MB",
    fileType: "video/mp4",
  },
  {
    id: "4",
    title: "Customer Testimonial",
    description: "Hear what our customers have to say about us",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 3, 10),
    duration: "2:18",
    fileSize: "18.3 MB",
    fileType: "video/mp4",
  },
  {
    id: "5",
    title: "Quarterly Update Q1 2023",
    description: "Overview of our Q1 2023 performance and roadmap",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 4, 20),
    duration: "12:45",
    fileSize: "98.2 MB",
    fileType: "video/mp4",
  },
  {
    id: "6",
    title: "How-to: Advanced Features",
    description: "Deep dive into our advanced features and capabilities",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    uploadDate: new Date(2023, 5, 2),
    duration: "15:20",
    fileSize: "124.6 MB",
    fileType: "video/mp4",
  },
]
export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

function RouteComponent() {
 return <MyUploadsPage></MyUploadsPage>
}

export default function MyUploadsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<(typeof mockVideos)[0] | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useNavigate()

  // Filter videos based on search query
  const filteredVideos = mockVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (videoId: string) => {
    // In a real app, you would call an API to delete the video
    console.log(`Deleting video with ID: ${videoId}`)
    setShowDeleteDialog(false)
    // Then refetch the videos or update the state
  }

  const handleShare = (videoId: string) => {
    // In a real app, you would implement sharing functionality
    console.log(`Sharing video with ID: ${videoId}`)
    // Could open a share dialog or copy a link to clipboard
    navigator.clipboard.writeText(`https://yourdomain.com/video/${videoId}`)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Uploads</h1>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search uploads..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>

          <Button asChild>
            <Link to="/video/upload">Upload New</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-[180px] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={video.thumbnailUrl || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-[180px] object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <Badge className="absolute top-2 right-2 bg-black/70">{video.duration}</Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
                  
                </div>


                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{format(video.uploadDate, "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? `No videos matching "${searchQuery}" were found.` : "You haven't uploaded any videos yet."}
          </p>
          <Button asChild>
            <Link to="/video/upload">Upload Your First Video</Link>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedVideo?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedVideo && handleDelete(selectedVideo.id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

