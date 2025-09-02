"use client";

import { useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

type Quality = {
  id: string;
  quality: string;
  objectId: string;
};

export default function VideoPlayer({ video }: { video: any }) {
  const [currentQuality, setCurrentQuality] = useState<Quality>(
    video.qualities[video.qualities.length - 1], // default highest
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <MediaPlayer
        title={video.name}
        src={{
          src: `/api/video/download/${currentQuality.objectId}`,
          type: "application/x-mpegURL",
        }}
        poster={
          video.thumbnail_object_id
            ? `/api/video/thumbnail/${video.thumbnail_object_id}`
            : undefined
        }
        className="w-full max-w-4xl aspect-video rounded-2xl shadow-xl overflow-hidden bg-black"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {/* Quality Selector */}
      <div className="relative">
        <select
          value={currentQuality.id}
          onChange={(e) => {
            const selected = video.qualities.find(
              (q: Quality) => q.id === e.target.value,
            );
            if (selected) setCurrentQuality(selected);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {video.qualities
            .slice()
            .reverse() // show highest first
            .map((q: Quality) => (
              <option key={q.id} value={q.id}>
                {q.quality}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
