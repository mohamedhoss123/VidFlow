"use client"

import Link from "next/link";
import { Children } from "react";
import Player from "~/components/advanced-player";
import { timeAgo } from "~/lib/utils";
import type { ReactNode } from "react";

export default function Video() {
  return (
    <div className="flex flex-col gap-3 max-md:col-span-12 col-span-9">
      <Player
        src='https://files.vidstack.io/sprite-fight/hls/stream.m3u8'
        viewType='video'
        streamType='on-demand'
        logLevel='warn'
        crossOrigin
        playsInline
        title='Sprite Fight'
        poster='https://files.vidstack.io/sprite-fight/poster.webp'
        className="aspect-video"
      />
    </div>
  );
}
