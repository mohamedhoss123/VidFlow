"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

type Playlist = {
  id: number;
  title: string;
  thumbnail: string;
  videosCount: number;
  createdAt: string;
};

export default function PlaylistsPage() {
  const router = useRouter();
  const [playlists] = useState<Playlist[]>([
    {
      id: 1,
      title: "Next.js Tutorials",
      thumbnail: "https://picsum.photos/seed/playlist1/400/225",
      videosCount: 12,
      createdAt: "2025-07-10",
    },
    {
      id: 2,
      title: "Docker & DevOps",
      thumbnail: "https://picsum.photos/seed/playlist2/400/225",
      videosCount: 8,
      createdAt: "2025-07-15",
    },
    {
      id: 3,
      title: "Database Guides",
      thumbnail: "https://picsum.photos/seed/playlist3/400/225",
      videosCount: 5,
      createdAt: "2025-08-01",
    },
  ]);

  const handleContextMenu = (e: React.MouseEvent, playlistId: number) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">My Playlists</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              onClick={() => router.push(`/library/${playlist.id}`)}
              onContextMenu={(e) => handleContextMenu(e, playlist.id)}
              className="cursor-pointer relative group"
            >
              <CardContent className="p-0">
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold line-clamp-2">
                    {playlist.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {playlist.videosCount} videos •{" "}
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, playlist.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full p-1 shadow-sm"
                ></button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
