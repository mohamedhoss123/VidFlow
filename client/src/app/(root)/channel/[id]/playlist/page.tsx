"use client";
import React, { useState } from "react";

// YouTube-like Channel Playlists Page
// Tailwind CSS classes used.

export default function ChannelPlaylistsPage() {
  const [subscribed, setSubscribed] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<number | null>(1);

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

  const playlists = [
    {
      id: 1,
      title: "Frontend Tutorials",
      description: "Learn React, Tailwind, and more with practical tutorials.",
      count: 6,
      cover: "https://picsum.photos/seed/playlist-1/420/236",
      items: [
        {
          id: 101,
          title: "React Hooks in Depth",
          duration: "12:34",
          views: 34000,
        },
        {
          id: 102,
          title: "Tailwind from Zero to Hero",
          duration: "15:02",
          views: 27000,
        },
        {
          id: 103,
          title: "State Management Patterns",
          duration: "10:45",
          views: 19000,
        },
      ],
    },
    {
      id: 2,
      title: "Backend & DevOps",
      description: "Everything from Docker to CI/CD pipelines.",
      count: 4,
      cover: "https://picsum.photos/seed/playlist-2/420/236",
      items: [
        { id: 201, title: "Intro to Docker", duration: "11:20", views: 22000 },
        {
          id: 202,
          title: "CI/CD with GitHub Actions",
          duration: "13:05",
          views: 18000,
        },
      ],
    },
    {
      id: 3,
      title: "Project Walkthroughs",
      description: "Step-by-step builds of complete apps.",
      count: 3,
      cover: "https://picsum.photos/seed/playlist-3/420/236",
      items: [
        {
          id: 301,
          title: "Building a Video Platform",
          duration: "22:10",
          views: 45000,
        },
      ],
    },
  ];

  const activePlaylist =
    playlists.find((p) => p.id === activePlaylistId) || playlists[0];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Home</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Videos</a>
            <a className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 font-medium">
              Playlists
            </a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Community</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">Channels</a>
            <a className="px-3 py-2 rounded-md hover:bg-gray-50">About</a>
          </nav>
        </div>

        {/* Content: Playlists grid + Sidebar */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-6">
          {/* Left column: playlists */}
          <div className="lg:col-span-3 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {playlists.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePlaylistId(p.id)}
                  className={`bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition ${
                    p.id === activePlaylistId ? "ring-2 ring-blue-400" : ""
                  }`}
                >
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {p.count} videos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: active playlist preview */}
          <aside className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-semibold mb-2">
              {activePlaylist.title}
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              {activePlaylist.count} videos · curated
            </p>

            <div className="space-y-2">
              {activePlaylist.items.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                    {it.duration}
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-2">
                      {it.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {it.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-3 py-2 rounded-md bg-gray-100 text-sm">
                Play all
              </button>
              <button className="px-3 py-2 rounded-md border text-sm">
                Shuffle
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
