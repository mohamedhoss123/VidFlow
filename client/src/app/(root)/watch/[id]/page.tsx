"use client";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Eye, EyeOff, Link as LLink } from "lucide-react"; // icons for public, private, unlisted
import { ThumbsUp, ThumbsDown, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import axiosInstance from "~/lib/api";
import Player from "~/components/root/video-player";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";

import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
const videoQuality = {
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1280, height: 720 },
  "480p": { width: 854, height: 480 },
  "360p": { width: 640, height: 360 },
  "240p": { width: 426, height: 240 },
  "144p": { width: 256, height: 144 },
};
interface Playlist {
  id: string;
  title: string;
  visibility: "public" | "private" | "unlisted";
  selected: boolean;
}

interface Comment {
  user: {
    name: string;
  };
  icon: string;
  content: string;
}

interface NewPlaylist {
  name: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
}

const mockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "Watch Later",
    visibility: "private",
    selected: true,
  },
  {
    id: "2",
    title: "Tech Tutorials",
    visibility: "public",
    selected: true,
  },
  {
    id: "3",
    title: "Music",
    visibility: "public",
    selected: false,
  },
  {
    id: "4",
    title: "Unlisted Demo",
    visibility: "unlisted",
    selected: true,
  },
];
export default function UserPage() {
  const [open, setOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState<NewPlaylist>({
    name: "",
    description: "",
    visibility: "public",
  });

  const handleSave = () => {
    console.log("New Playlist:", newPlaylist);
    // TODO: Call backend API to save playlist
    setOpen(false);
    setNewPlaylist({ name: "", description: "", visibility: "public" });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);

  const handelSelect = (id: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)),
    );
    // take video id and send reqeust to backend
  };

  const handelNewPlaylist = async () => {
    // const selectedIds = playlists.filter((p) => p.selected).map((p) => p.id);
    // await fetch(`/api/videos/${data.id}/add-to-playlists`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ playlists: selectedIds }),
    // });
    console.log(newPlaylist);
    setDialogOpen(false);
  };
  const params = useParams();
  const videoId = params.id;
  const [likes, setLikes] = useState(120);
  const [data, setData] = useState<any>({});
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextComment, setNextComment] = useState(null);
  function getVideoInfo() {
    axiosInstance.get(`/api/video/${videoId}`).then((res) => {
      const out = res.data;
      setData(out);
      setLikes(out.likes_count);
    });
  }
  function getCommenst() {
    axiosInstance
      .get(`/api/video/${videoId}/comment`, { params: { cursor: nextComment } })
      .then((res) => {
        const out = res.data;
        setComments((old) => [...old, ...out.comments]);
        setNextComment(out.nextCursor);
      });
  }

  const handleComment = () => {
    if (comment.trim()) {
      axiosInstance
        .post(`/api/video/${videoId}/comment`, { content: comment })
        .then((res) => {
          setComments([res.data, ...comments]);
        });
      setComment("");
    }
  };

  useEffect(() => {
    getCommenst();
    getVideoInfo();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Video Player */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex flex-col gap-3 max-md:col-span-12 col-span-9">
          {data.qualities && <Player video={data} />}
        </div>

        {/* Channel Info + Subscribe */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <Link href="/channel/link-here">
              {" "}
              {/* replace later */}
              <img
                src={data.channel_image || "https://placehold.co/40"}
                alt="channel"
                className="w-10 h-10 rounded-full cursor-pointer"
              />
            </Link>
            <div>
              <Link
                href="/channel/link-here" // replace later
                className="font-semibold hover:underline"
              >
                {data.channel_name || "Channel Name"}
              </Link>
              <p className="text-xs text-neutral-500">
                {data.subscribers || 0} subscribers
              </p>
            </div>
          </div>
          <Button className="bg-red-600 text-white hover:bg-red-700">
            Subscribe
          </Button>
        </div>

        {/* Video Info + Actions */}
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLikes(likes + 1)}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="w-4 h-4" /> {likes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>

        {/* Add to Playlist Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                >
                  <Checkbox
                    checked={playlist.selected}
                    onCheckedChange={() => handelSelect(playlist.id)}
                  />

                  {/* Visibility Icon */}
                  {playlist.visibility === "public" && (
                    <Eye className="w-4 h-4 text-green-600" />
                  )}
                  {playlist.visibility === "private" && (
                    <EyeOff className="w-4 h-4 text-red-600" />
                  )}
                  {playlist.visibility === "unlisted" && (
                    <LLink className="w-4 h-4 text-yellow-600" />
                  )}

                  {/* Playlist title */}
                  <span>{playlist.title}</span>
                </div>
              ))}
              {playlists.length === 0 && (
                <p className="text-sm text-gray-500">No playlists found.</p>
              )}
            </div>
            <DialogFooter>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="Playlist name"
                      value={newPlaylist.name}
                      onChange={(e) =>
                        setNewPlaylist((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />

                    <Textarea
                      placeholder="Description"
                      value={newPlaylist.description}
                      onChange={(e) =>
                        setNewPlaylist((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />

                    <Select
                      value={newPlaylist.visibility}
                      onValueChange={(value) =>
                        setNewPlaylist((prev) => ({
                          ...prev,
                          visibility: value as
                            | "public"
                            | "private"
                            | "unlisted",
                        }))
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

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handelNewPlaylist}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Trigger button */}
              <Button onClick={() => setOpen(true)}>Add Playlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Section */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Comments</h2>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleComment}>Post</Button>
            </div>
            <div className="space-y-2">
              <InfiniteScroll
                dataLength={comments.length} //This is important field to render the next data
                next={getCommenst}
                hasMore={nextComment ? true : false}
                loader={<h4>Loading...</h4>}
              >
                {comments.length > 0 ? (
                  comments.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 bg-neutral-100 rounded-md flex space-x-2 mt-5"
                    >
                      <img
                        src={c.icon || "https://placehold.co/400x40"}
                        alt={c.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium">{c.user.name}</p>
                        <p className="text-sm text-neutral-700">{c.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No comments yet.</p>
                )}
              </InfiniteScroll>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Videos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Suggested Videos</h2>
        <div className="space-y-2">
          <div className="w-full aspect-video bg-neutral-200 rounded-md" />
          <div className="w-full aspect-video bg-neutral-200 rounded-md" />
          <div className="w-full aspect-video bg-neutral-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}
