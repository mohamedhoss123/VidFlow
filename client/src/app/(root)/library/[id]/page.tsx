"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

type Video = {
  id: number;
  title: string;
  thumbnail: string;
  views: number;
  createdAt: string;
};

type Playlist = {
  id: number;
  title: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  createdAt: string;
  videos: Video[];
};

export default function PlaylistDetailPage() {
  const [playlist, setPlaylist] = useState<Playlist>({
    id: 1,
    title: "Next.js Tutorials",
    description:
      "A collection of tutorials covering everything you need to know about Next.js.",
    visibility: "public",
    createdAt: "2025-07-10",
    videos: [
      {
        id: 1,
        title: "Getting Started with Next.js",
        thumbnail: "https://picsum.photos/seed/vid1/400/225",
        views: 15400,
        createdAt: "2025-08-01",
      },
      {
        id: 2,
        title: "Next.js Routing Deep Dive",
        thumbnail: "https://picsum.photos/seed/vid2/400/225",
        views: 11200,
        createdAt: "2025-08-05",
      },
      {
        id: 3,
        title: "Next.js API Routes Explained",
        thumbnail: "https://picsum.photos/seed/vid3/400/225",
        views: 9800,
        createdAt: "2025-08-12",
      },
    ],
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(playlist);

  const handleSave = () => {
    setPlaylist(editData);
    setEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sidebar with Playlist Info */}
        <aside className="w-1/4 bg-white rounded-lg shadow-sm p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{playlist.title}</h2>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <Select
                      value={editData.visibility}
                      onValueChange={(val: "public" | "private" | "unlisted") =>
                        setEditData({ ...editData, visibility: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-gray-600 mb-4">{playlist.description}</p>
          <p className="text-xs text-gray-500 mb-2">
            Created at: {new Date(playlist.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mb-2">
            Visibility: {playlist.visibility}
          </p>
          <p className="text-xs text-gray-500">
            {playlist.videos.length} videos
          </p>
        </aside>

        {/* Videos in Playlist */}
        <main className="flex-1 space-y-6">
          <h1 className="text-2xl font-semibold mb-4">Videos</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playlist.videos.map((video) => (
              <Card key={video.id} className="cursor-pointer relative group">
                {/**/}
                <Link href="/watch/0199095a-b786-7c9c-b0b2-b405d6a48d7a">
                  <CardContent className="p-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {video.views.toLocaleString()} views •{" "}
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`More actions for video ${video.id}`);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white rounded-full p-1 shadow-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
