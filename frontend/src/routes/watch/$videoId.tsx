import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import VideoInfo from '@/components/video/video-info'

export const Route = createFileRoute('/watch/$videoId')({
  component: RouteComponent,
})

function RouteComponent() {
  const {videoId} = Route.useParams()
  return<div className="container mx-auto px-4 py-8">

          <VideoPlayer />
          <VideoInfo />

    </div>
}



function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const setVideoData = () => {
      setDuration(video.duration)
    }

    const updateTime = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener("loadedmetadata", setVideoData)
    video.addEventListener("timeupdate", updateTime)

    return () => {
      video.removeEventListener("loadedmetadata", setVideoData)
      video.removeEventListener("timeupdate", updateTime)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen()
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10
    }
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10
    }
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        poster="/placeholder.svg?height=720&width=1280"
        onClick={togglePlay}
        crossOrigin="anonymous"
      >
        <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

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

            <button onClick={handleFullscreen} className="p-1 hover:bg-white/10 rounded-full">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"


