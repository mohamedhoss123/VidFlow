"use client";
import React from "react";
import VideoCard from "~/components/root/video-card";
import Header from "~/components/root/header";
import Sidebar from "~/components/root/sidebar";
import ChannelCard from "~/components/root/channel-card";

import { useState, useRef, useEffect } from "react";
import axiosInstance from "~/lib/api";
const SubscriptionsPage = () => {
  const channels = [
    { name: "Sophia Carter", image: "https://picsum.photos/100?1" },
    { name: "Ethan Bennett", image: "https://picsum.photos/100?2" },
    { name: "Olivia Hayes", image: "https://picsum.photos/100?3" },
    { name: "Liam Foster", image: "https://picsum.photos/100?4" },
    { name: "Ava Morgan", image: "https://picsum.photos/100?5" },
    { name: "Noah Parker", image: "https://picsum.photos/100?6" },
  ];

  const [videos, setVideos] = useState<
    Array<{ title: string; channel: string; thumbnail: string }>
  >([]);
  const nextCursor = useRef(null);

  function fetchNewVideos() {
    axiosInstance
      .get(`/api/video`, { params: { cursor: nextCursor.current } })
      .then((res) => {
        console.log(res.data);
        setVideos((prev) => [...prev, ...res.data.videos]);
        nextCursor.current = res.data.nextCursor;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  useEffect(() => {
    fetchNewVideos();
  }, []);
  return (
    <>
      <h2 className="text-[28px] font-bold text-[#141414] pb-3">
        Subscriptions
      </h2>
      <div className="flex overflow-x-auto gap-8 p-4">
        {channels.map((c) => (
          <ChannelCard key={c.name} {...c} />
        ))}
      </div>

      <h3 className="text-lg font-bold text-[#141414] px-4 pb-2 pt-4">
        Continue Watching
      </h3>
      <div className="grid grid-cols-3 gap-3 p-4">
        {videos.map((v, idx) => (
          <VideoCard key={idx} {...v} />
        ))}
      </div>
    </>
  );
};

export default SubscriptionsPage;
