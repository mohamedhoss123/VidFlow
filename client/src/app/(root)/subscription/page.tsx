import React from "react";
import VideoCard from "~/components/root/video-card";
import Header from "~/components/root/header";
import Sidebar from "~/components/root/sidebar";
import ChannelCard from "~/components/root/channel-card";


const SubscriptionsPage = () => {
  const channels = [
    { name: "Sophia Carter", image: "https://picsum.photos/100?1" },
    { name: "Ethan Bennett", image: "https://picsum.photos/100?2" },
    { name: "Olivia Hayes", image: "https://picsum.photos/100?3" },
    { name: "Liam Foster", image: "https://picsum.photos/100?4" },
    { name: "Ava Morgan", image: "https://picsum.photos/100?5" },
    { name: "Noah Parker", image: "https://picsum.photos/100?6" },
  ];

  const videos = [
    {
      title: "Exploring the Hidden Gems of the Pacific Northwest",
      channel: "Traveler's Tales",
      thumbnail: "https://picsum.photos/400/200?1",
    },
    {
      title: "Mastering React in 2025",
      channel: "Code Academy",
      thumbnail: "https://picsum.photos/400/200?2",
    },
  ];

  return (
    <>
          <h2 className="text-[28px] font-bold text-[#141414] pb-3">Subscriptions</h2>
          <div className="flex overflow-x-auto gap-8 p-4">
            {channels.map((c) => (
              <ChannelCard key={c.name} {...c} />
            ))}
          </div>

          <h3 className="text-lg font-bold text-[#141414] px-4 pb-2 pt-4">
            Continue Watching
          </h3>
          <div className="flex overflow-x-auto gap-3 p-4">
            {videos.map((v, idx) => (
              <VideoCard key={idx} {...v} />
            ))}
          </div>
    </>
  );
};

export default SubscriptionsPage;
