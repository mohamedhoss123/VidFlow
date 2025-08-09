"use client"

import { FilePlay } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "~/lib/utils";

export default function Home() {
  const videosmockdata = [
    { id: 1, title: "Sample Video 1", thumbnail: "https://picsum.photos/id/237/300/200" },
    { id: 2, title: "Sample Video 2", thumbnail: "https://picsum.photos/id/238/300/200" },
    { id: 3, title: "Sample Video 3", thumbnail: "https://picsum.photos/id/239/300/200" },
    { id: 4, title: "Sample Video 4", thumbnail: "https://picsum.photos/id/240/300/200" },
    { id: 5, title: "Sample Video 5", thumbnail: "https://picsum.photos/id/241/300/200" },
    { id: 3, title: "Sample Video 3", thumbnail: "https://picsum.photos/id/239/300/200" },
    { id: 4, title: "Sample Video 4", thumbnail: "https://picsum.photos/id/240/300/200" },
    { id: 5, title: "Sample Video 5", thumbnail: "https://picsum.photos/id/241/300/200" }
  ]



  // Example
  const date = new Date();
  date.setDate(date.getDate() - 21);


  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold">
        My Videos
      </h1>
      <div className="grid grid-cols-5 gap-4">

        {
          videosmockdata.map(video => (
            <Link href={`/video/${video.id}`} key={video.id}>
              <div key={video.id} className="flex flex-col gap-2">
                <img src={video.thumbnail} alt={video.title} width={300} height={200} className="rounded-lg border" />
                <div className="flex gap-2 items-center justify-between">
                  <p className="text-lg font-semibold text-secondary-foreground">{video.title}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{timeAgo(date)}</p>
                </div>
              </div>
            </Link>
          ))
        }
      </div>

    </div>
  );
}
