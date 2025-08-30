"use client"

import Link from "next/link";
import { timeAgo } from "~/lib/utils";
import { getVideos } from "~/services/api";



export default function Video({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  
  return (
    <div className="flex gap-3">
      <div className="grid max-md:grid-flow-row grid-cols-12 gap-4">
        {children}

        <div className="gap-2 col-span-3 max-md:col-span-12 grid max-md:grid-cols-12">

          {
            getVideos().map(video => (
              <Link href={`/video/${video.id}`} key={video.id} className="max-md:col-span-4">
                <div key={video.id} className="flex flex-col gap-1">
                  <img loading="lazy" decoding="async" src={video.thumbnail} alt={video.title} className="rounded-lg aspect-video border w-full h-auto" />
                  <div className="flex gap-2 items-start justify-between">
                    <p className="text-lg leading-5 font-semibold text-secondary-foreground">{video.title}</p>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{timeAgo(video.createdAt)}</p>
                </div>
              </Link>
            ))
          }
        </div>

      </div>
    </div>
  );
}
