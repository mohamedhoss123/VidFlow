"use client";
import React, { useMemo } from "react";
import VideoCard from "~/components/root/subscription/video-card";
import ChannelCard from "~/components/root/channel-card";
import { Users } from "lucide-react";
import axiosInstance from "~/lib/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";

async function fetchSubscriptionsChannels() {
  return (await axiosInstance.get("/api/users/me/subscription")).data;
}

const SubscriptionsPage = () => {
  // fetch channels
  const {
    data: channels,
    isLoading: channelLoading,
    error: channelError,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchSubscriptionsChannels,
  });

  // fetch videos with infinite query
  const fetchVideos = async ({ pageParam }: { pageParam: string | null }) => {
    const res = await axiosInstance.get(`/api/users/me/subscription/videos`, {
      params: { cursor: pageParam },
    });
    return res.data;
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["subscriptionVideos"],
    queryFn: fetchVideos,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  const videos = useMemo(() => {
    return data?.pages.flatMap((page) => page.videos) ?? [];
  }, [data]);

  if (isError) {
    console.error(error);
    return <div>Error loading videos.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2 className="text-[28px] font-bold text-[#141414] pb-3">
        Subscriptions
      </h2>

      {channelLoading ? (
        <p>Loading Subscriptions...</p>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-12 text-gray-600">
          <Users className="w-16 h-16 mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Subscriptions Yet</h3>
          <p className="text-base text-gray-500 mb-4">
            Subscribe to channels to see them here.
          </p>
          <Link href="/home">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
              Discover Channels
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex overflow-x-auto gap-8 p-4">
            {channels.map((c: any) => (
              <ChannelCard
                key={c.id}
                name={c.following.name}
                id={c.following.id}
                image={
                  c.img ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${c.following.name}`
                }
              />
            ))}
          </div>

          <h3 className="text-lg font-bold text-[#141414] px-4 pb-2 pt-4">
            Continue Watching
          </h3>

          <InfiniteScroll
            dataLength={videos.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<div className="text-center p-4">Loading more...</div>}
            endMessage={
              videos.length > 0 ? (
                <div className="text-center p-4">No more videos.</div>
              ) : null
            }
            className="grid grid-cols-3 gap-3 p-4"
          >
            {videos.map((v: any, idx: number) => (
              <VideoCard key={idx} {...v} />
            ))}
          </InfiniteScroll>
        </>
      )}
    </>
  );
};

export default SubscriptionsPage;
