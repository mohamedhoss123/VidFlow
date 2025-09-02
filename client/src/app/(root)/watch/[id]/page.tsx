"use client";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useParams } from "next/navigation";
import axiosInstance from "~/lib/api";
import Player from "~/components/root/video-player";

const videoQuality = {
  "1080p": {
    width: 1920,
    height: 1080,
  },
  "720p": {
    width: 1280,
    height: 720,
  },
  "480p": {
    width: 854,
    height: 480,
  },
  "360p": {
    width: 640,
    height: 360,
  },
  "240p": {
    width: 426,
    height: 240,
  },
  "144p": {
    width: 256,
    height: 144,
  },
};

export default function UserPage() {
  const params = useParams();
  const videoId = params.id; // if route is /users/[id]
  const [likes, setLikes] = useState(120);
  const [data, setData] = useState({});
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  function getVideoInfo() {
    axiosInstance.get(`/api/video/${videoId}`).then((data) => {
      const out = data.data;
      setData(out);
      setLikes(out.likes_count);
    });
  }
  function getComment() {
    axiosInstance.get(`/api/video/${videoId}/comment`);
  }
  const handleComment = () => {
    if (comment.trim()) {
      setComments([comment, ...comments]);
      setComment("");
    }
  };
  useEffect(() => {
    getVideoInfo();
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Video Player */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex flex-col gap-3 max-md:col-span-12 col-span-9">
          {data.qualities && <Player video={data} />}
        </div>

        {/* Video Info + Actions */}
        <div className="flex items-center justify-between">
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
          </div>
        </div>

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
              {comments.length > 0 ? (
                comments.map((c, i) => (
                  <div key={i} className="p-2 bg-neutral-100 rounded-md">
                    {c}
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No comments yet.</p>
              )}
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
