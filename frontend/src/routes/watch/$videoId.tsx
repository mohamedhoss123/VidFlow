import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Ellipsis, AudioLines, MoveRight, ArrowRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {  Share2, Flag, MoreHorizontal } from "lucide-react"
import ReactPlayer from "react-player"

import { DropdownMenu, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { api } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'
export const Route = createFileRoute('/watch/$videoId')({
  component: RouteComponent,
})

function RouteComponent() {
  const {videoId} = Route.useParams()
  return<div className="container mx-auto px-4 py-8">

          <VideoPlayer videoId={videoId} />

    </div>
}





  
  

function VideoPlayer({videoId} : {videoId: string}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [videoUrl, setVideoUrl] = useState("")
  const [qualitys, setQualitys] = useState([])
  const [currentQuality, setCurrentQuality] = useState(0)
  const videoRef = useRef<ReactPlayer>(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)


  useEffect(()=>{
    videoRef.current?.seekTo(currentTime)
  },[currentTime])
  
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded)
  }
  const {data} = useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const response = await api.get(`/videos/${videoId}/info`)
      return response.data
    },
    
  })

  useEffect(() => { 
    console.log(data);
    if(data){
      setVideoUrl(`${import.meta.env.VITE_API_URL}/videos/${data.quality[0].url}`)
      setQualitys(data.quality)
      setCurrentQuality(data.quality[0].quality)
    }
  },[data])
  useEffect(() => {console.log(videoUrl)}, [videoUrl])
  const togglePlay = () => {
      setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      setIsMuted(newVolume === 0)
    }
  }

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.seekTo(newTime) 
    }
  }

  const handleRender = ({ playedSeconds}:{playedSeconds: number})=> { 
    setDuration(videoRef.current?.getDuration() || 0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.showPreview()
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.seekTo(videoRef.current.getCurrentTime()+10) 
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.seekTo(videoRef.current.getCurrentTime()-10) 

    }
  }

  return (
    <div>
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div onClick={togglePlay}>
      <ReactPlayer
        className="w-full aspect-video"
        crossOrigin="anonymous"
        url={videoUrl}
        playing={isPlaying}
        ref={videoRef}
        muted={isMuted}
        volume={volume}
        width={"100%"}
        height={"100%"}
        onProgress={handleRender}
      
        />
       
      </div>
    

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex flex-col gap-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="cursor-pointer"
          />

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-1 hover:bg-white/10 rounded-full">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

           <button onClick={skipBackward} className="p-1 hover:bg-white/10 rounded-full">
                <SkipBack size={20} />
              </button>

              <button onClick={skipForward} className="p-1 hover:bg-white/10 rounded-full">
                <SkipForward size={20} />
              </button>  
               

              <div className="flex items-center gap-2 ml-2">
                <button onClick={toggleMute} className="p-1 hover:bg-white/10 rounded-full">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20 cursor-pointer"
                />
              </div>

              <span className="text-xs ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span> 
            </div>

            <div className='flex space-x-8'>
            <DropdownMenu >
              <DropdownMenuTrigger>
              <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-50'>
                {qualitys.map((quality:any, index) => (
                  <DropdownMenuItem key={index} onClick={() => {
                    setVideoUrl(`${import.meta.env.VITE_API_URL}/videos/${quality.url}`)
                    setCurrentQuality(quality.quality)
                    setCurrentTime(videoRef?.current?.getCurrentTime()||0)
                    
                  }}>
                    {quality.quality}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={handleFullscreen} className="p-1 hover:bg-white/10 rounded-full">
              <Maximize size={20} />
            </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    {data && (<div className="space-y-4">
        <h1 className="text-xl font-bold">{data.name}</h1>
  
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
            <p>{data.description} </p>
          </div>
  
          <Button variant="ghost" size="sm" onClick={toggleDescription} className="mt-2">
            {isDescriptionExpanded ? "Show less" : "Show more"}
          </Button>
        </div>
      </div>)}
    </div>
  )
}



