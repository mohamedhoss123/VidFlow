"use client";

import { useState } from "react";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { Card, CardContent } from "~/components/ui/card";

type Video = {
  id: number;
  title: string;
  thumbnail: string;
  views: number;
  createdAt: string;
};

export default function MyVideosPage() {
  const router = useRouter();
  const [videos] = useState<Video[]>([
    {
      id: 1,
      title: "Building a YouTube Clone with Next.js",
      thumbnail: "https://picsum.photos/seed/video1/400/225",
      views: 15400,
      createdAt: "2025-08-01",
    },
    {
      id: 2,
      title: "Intro to Prisma with PostgreSQL",
      thumbnail: "https://picsum.photos/seed/video2/400/225",
      views: 9200,
      createdAt: "2025-08-05",
    },
    {
      id: 3,
      title: "Docker Compose for Beginners",
      thumbnail: "https://picsum.photos/seed/video3/400/225",
      views: 7700,
      createdAt: "2025-08-20",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Videos</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <ContextMenu key={video.id}>
              <ContextMenuTrigger asChild>
                <Card
                  onClick={() => router.push(`/studio/edit/${video.id}`)}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {video.views.toLocaleString()} views •{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-40">
                <ContextMenuItem
                  onClick={() => router.push(`/studio/edit/${video.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => alert(`Delete video ${video.id}`)}
                  className="text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>
    </div>
  );
}
