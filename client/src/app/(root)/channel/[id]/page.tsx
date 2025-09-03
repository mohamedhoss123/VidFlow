"use client";
import React, { useState } from "react";

// YouTube-like Channel Page (single-file React component)
// Tailwind CSS classes used. Drop this component into a Next.js or Create React App project
// Ensure Tailwind is configured in the project for correct styling.

export default function YouTubeChannelPage() {
  const [subscribed, setSubscribed] = useState(false);

  const channel = {
    name: "Mohamed Hossam",
    handle: "@mohamedh",
    subscribers: 124_000,
    avatar: "https://i.pravatar.cc/150?img=12",
    banner:
      "https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?w=1600&q=80",
    verified: true,
    description:
      "Building cool projects, tutorials, and behind-the-scenes of web apps. Subscribe for weekly uploads!",
  };

  const videos = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Sample video title ${i + 1} — Building an example UI`,
    views: Math.floor(Math.random() * 200_000) + 1_000,
    uploaded: `${Math.floor(Math.random() * 12) + 1} months ago`,
    duration: `${Math.floor(Math.random() * 20) + 3}:${Math.floor(
      Math.random() * 60,
    )
      .toString()
      .padStart(2, "0")}`,
    thumb: `https://picsum.photos/seed/video-${i}/420/236`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}

      {/* Channel header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img
              src={channel.avatar}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{channel.name}</h1>
                {channel.verified && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {channel.handle} · {channel.subscribers.toLocaleString()}{" "}
                subscribers
              </p>
              <p className="mt-2 text-sm text-gray-700 max-w-xl">
                {channel.description}
              </p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Subscribe / Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubscribed(!subscribed)}
              className={`px-5 py-2.5 rounded-full font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 ${
                subscribed
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>

            <button className="px-3 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Customize
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 bg-white rounded-xl shadow-md p-3">
          <nav className="flex gap-4 text-sm text-gray-600">
            <a className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 font-medium">
              Home
            </a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Videos</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Playlists</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Community</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Channels</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">About</a>
          </nav>
        </div>

        {/* Content: Videos grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-6">
          {/* Left column: videos */}
          <div className="lg:col-span-3 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={v.thumb}
                      alt={v.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute right-2 bottom-2 text-xs bg-black/80 text-white px-2 py-1 rounded">
                      {v.duration}
                    </div>
                  </div>
                  <div className="p-3 flex gap-3">
                    <img
                      src={`https://i.pravatar.cc/40?img=${v.id + 3}`}
                      alt="ch"
                      className="w-10 h-10 rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {v.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {v.views.toLocaleString()} views · {v.uploaded}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination stub */}
            <div className="mt-6 flex justify-center">
              <button className="px-4 py-2 rounded-md border border-gray-200">
                Load more
              </button>
            </div>
          </div>

          {/* Right column: sidebar */}
          <aside className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-semibold mb-3">Featured</h4>
            <div className="flex flex-col gap-3">
              {videos.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-start gap-3">
                  <img
                    src={v.thumb}
                    alt={v.title}
                    className="w-28 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium line-clamp-2">
                      {v.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
