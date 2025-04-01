
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {  Share2, Flag, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function VideoInfo() {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  

  
    const toggleDescription = () => {
      setIsDescriptionExpanded(!isDescriptionExpanded)
    }
  
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Building a Video Player with React and Next.js</h1>
  
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Channel" />
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
  
            <div>
              <h3 className="font-medium">React Tutorials</h3>
            </div>
  
          </div>
  
          <div className="flex items-center gap-2">

  
            <Button variant="ghost" size="sm" className="rounded-full">
              <Share2 size={18} className="mr-2" /> Share
            </Button>
  
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag size={16} className="mr-2" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
  
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-medium">125K views</span>
            <span>•</span>
            <span>2 weeks ago</span>
          </div>
  
          <div className={`text-sm ${isDescriptionExpanded ? "" : "line-clamp-3"}`}>
            <p>
              In this tutorial, we'll learn how to build a custom video player using React and Next.js. We'll implement
              features like play/pause controls, volume adjustment, progress bar, fullscreen mode, and more. This video
              player is fully responsive and works on all devices.
            </p>
            <p className="mt-2">
              We'll also cover how to stream videos efficiently in Next.js using React Suspense for a better user
              experience. [^3] This approach prevents the page from blocking, meaning users can interact with the page
              while the video component streams in.
            </p>
            <p className="mt-2">
              Topics covered: - Setting up a Next.js project - Creating a custom video player component - Implementing
              video controls - Handling video events - Making the player responsive - Adding keyboard shortcuts -
              Optimizing performance
            </p>
          </div>
  
          <Button variant="ghost" size="sm" onClick={toggleDescription} className="mt-2">
            {isDescriptionExpanded ? "Show less" : "Show more"}
          </Button>
        </div>
      </div>
    )
  }
  
  