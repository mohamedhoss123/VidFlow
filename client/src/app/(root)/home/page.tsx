"use client";
import { useMemo } from "react";
import VideoCard from "~/components/root/video-card";
import axiosInstance from "~/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

export default function HomePage() {
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
        {videos.map((video, idx) => (
          <VideoCard key={idx} {...video} />
        ))}
      </InfiniteScroll>
    </>
  );
}
