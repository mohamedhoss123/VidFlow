"use client";
import React from "react";
import VideoCard from "~/components/root/video-card";
import Header from "~/components/root/header";
import Sidebar from "~/components/root/sidebar";
import ChannelCard from "~/components/root/channel-card";

import { useCallback, useMemo, useRef } from "react";
import axiosInstance from "~/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

const SubscriptionsPage = () => {
  const channels = [
    { name: "Sophia Carter", image: "https://picsum.photos/100?1" },
    { name: "Ethan Bennett", image: "https://picsum.photos/100?2" },
    { name: "Olivia Hayes", image: "https://picsum.photos/100?3" },
    { name: "Liam Foster", image: "https://picsum.photos/100?4" },
    { name: "Ava Morgan", image: "https://picsum.photos/100?5" },
    { name: "Noah Parker", image: "https://picsum.photos/100?6" },
  ];

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchVideos = async ({ pageParam }: { pageParam: string | null }) => {
    const res = await axiosInstance.get(`/api/video`, {
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

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading],
  );

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
      <div className="flex overflow-x-auto gap-8 p-4">
        {channels.map((c) => (
          <ChannelCard key={c.name} {...c} />
        ))}
      </div>

      <h3 className="text-lg font-bold text-[#141414] px-4 pb-2 pt-4">
        Continue Watching
      </h3>
      <div className="grid grid-cols-3 gap-3 p-4">
        {videos.map((v, idx) => {
          const isLast = idx === videos.length - 1;
          return (
            <div key={idx} ref={isLast ? lastElementRef : null}>
              <VideoCard {...v} />
            </div>
          );
        })}
      </div>
      {isFetchingNextPage && (
        <div className="text-center p-4">Loading more...</div>
      )}
      {!hasNextPage && videos.length > 0 && (
        <div className="text-center p-4">No more videos.</div>
      )}
    </>
  );
};

export default SubscriptionsPage;
