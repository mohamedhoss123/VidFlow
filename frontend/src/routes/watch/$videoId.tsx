import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Ellipsis, AudioLines, MoveRight, ArrowRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import VideoInfo from '@/components/video/video-info'
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
          <VideoInfo />

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
    console.log(data.quality[0].url)
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
    setCurrentTime(playedSeconds)
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
                <DropdownMenuItem className='flex justify-between items-center space-x-1.5 h-[1.8rem]'>
                  <div className='flex space-x-1'>
                    <AudioLines />
                    <p>Qualtu</p>
                  </div>
                  <div className='flex space-x-1'>
                    <p>{currentQuality}</p>
                    <ArrowRight />
                </div>
                </DropdownMenuItem>
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
  )
}

"use client"


