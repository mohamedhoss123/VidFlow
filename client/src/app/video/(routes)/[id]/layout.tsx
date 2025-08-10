"use client"

import Link from "next/link";
import { timeAgo } from "~/lib/utils";


export default function Video({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const videosmockdata = [
    { id: 1, title: "Sample Video 1", thumbnail: "https://picsum.photos/id/237/350/250" },
    { id: 2, title: "Sample Video 2", thumbnail: "https://picsum.photos/id/238/350/250" },
    { id: 3, title: "Sample Video 3", thumbnail: "https://picsum.photos/id/239/350/250" },
    { id: 4, title: "Sample Video 4", thumbnail: "https://picsum.photos/id/240/350/250" },
    { id: 5, title: "Sample Video 5", thumbnail: "https://picsum.photos/id/241/350/250" },
    { id: 3, title: "Sample Video 3", thumbnail: "https://picsum.photos/id/239/350/250" },
    { id: 4, title: "Sample Video 4", thumbnail: "https://picsum.photos/id/240/350/250" },
    { id: 5, title: "Sample Video 5", thumbnail: "https://picsum.photos/id/241/350/250" }
  ]



  // Example
  const date = new Date();
  date.setDate(date.getDate() - 21);


  return (
    <div className="flex gap-3">
      <div className="grid grid-cols-12 gap-4">
        <div className="gap-2 col-span-3 flex flex-col">

          {
            videosmockdata.map(video => (
              <Link href={`/video/${video.id}`} key={video.id}>
                <div key={video.id}>
                  <img src={video.thumbnail} alt={video.title} width={350} height={250} className="rounded-lg border" />
                  <div className="flex gap-2 items-center justify-between w-full">
                    <p className="text-lg font-semibold text-secondary-foreground">{video.title}</p>
                    <p className="text-sm font-semibold text-muted-foreground">{timeAgo(date)}</p>
                  </div>
                </div>
              </Link>
            ))
          }

        </div>
      </div>
      {children}
    </div>
  );
}
