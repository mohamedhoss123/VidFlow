
'use client'
import { useEffect, useRef, useState } from "react";
import VideoCard from "~/components/root/video-card";
import axiosInstance from "~/lib/api";





    
const dummyVideos = [
  {
    title: "Exploring the Hidden Gems of the Pacific Northwest",
    channel: "Traveler's Tales",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2N8jqB9LWxuMGKHiQm8AqXPAPzSG4k_2a0jSjQQWGEwT3egUCIMlTibsczl5rIOUFdurpmeRKTgyo0EFi6W-dhNIBNoOTBnQ3e1kB-F3sZZ_XKOt5Sb__fnHd51gfFJ_Qm-McT0QuOpH0mUi0cnJUqk32z8B7xgsJbNnjf3F-QmBNOU-QiuxISWv-Pt4jIx2ajKiVHlRMyVzwDzuDt5NYn2M0ynEbXbczDBT9kFXONbiKpVf2eBpFlCoVRExnKqnQoFCDC3KcQe5n",
  },
  {
    title: "A Day in the Life of a Software Engineer",
    channel: "Tech Insights",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5R8euPuiZTWTUy_iQ04CW88_hiUXHfvfR22Tpcaj97yX0VejOuHxbLmWFOpGhMg0eBJSgp5pvqa-wug5DkEkRqxeqeRjEoURnpf6SNoh95WIMuUGI_Zwic3qyZpSHBuu16fgSrZj0tGBAq5NgmVjb8XUEIIRciAB7pZO8YHARDCSsL7i6kVLjQBVwvYchocBlHctBVY7uXyr0afXJK3qGs1JebRZgnTmNvxTj5votgEGSni-Ik4JAUYqcfuNJvU0h6XovqJhJYsdQ",
  },
];

export default function HomePage() {
  const [videos,setVideos] = useState<Array<{title:string,channel:string,thumbnail:string}>>([])
  const nextCursor = useRef(null)
  
  function fetchNewVideos(){

    axiosInstance.get(`/api/video`,{params:{cursor:nextCursor.current}}).then((res)=>{
      console.log(res.data)
      setVideos((prev)=>[...prev,...res.data.videos])
      nextCursor.current = res.data.nextCursor
    }).catch(err=>{
      console.error(err)
    })
  }

  useEffect(()=>{
    fetchNewVideos()
  },[])
  return (
     <>
          <h2 className="text-[28px] font-bold px-4 pt-5 pb-3">Recommended</h2>
          <div className="grid grid-cols-3 gap-3 p-4">
            {videos.map((video, idx) => {
              const row = Math.floor(idx / 3)
              return (
                <div key={idx} className={`grid-row-${row + 1}`}>
                  <VideoCard {...video} />
                </div>
              )
            })}
          </div>
          <button onClick={fetchNewVideos}>more</button>
      </>
  );
}
