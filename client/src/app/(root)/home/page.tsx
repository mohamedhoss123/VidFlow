"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VideoCard from "~/components/root/video-card";
import axiosInstance from "~/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function HomePage() {
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
    queryKey: ["videos"],
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
      <h2 className="text-[28px] font-bold px-4 pt-5 pb-3">Recommended</h2>
      <div className="grid grid-cols-3 gap-3 p-4">
        {videos.map((video, idx) => {
          const row = Math.floor(idx / 3);
          const isLast = idx === videos.length - 1;
          return (
            <div
              key={idx}
              ref={isLast ? lastElementRef : null}
              className={`grid-row-${row + 1}`}
            >
              <VideoCard {...video} />
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
}
