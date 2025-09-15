"use client";

import { useState } from "react";

export default function EditVideoPage({ params }: { params: { id: string } }) {
  // Normally, you'd fetch this video from an API
  const [video, setVideo] = useState({
    id: params.id,
    title: "Building a YouTube Clone with Next.js",
    description:
      "Learn how to build a YouTube-like platform using Next.js, Tailwind, and Prisma.",
    thumbnail: null as File | null,
    preview: "https://picsum.photos/seed/video1/400/225",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "thumbnail" && files && files[0]) {
      setVideo({
        ...video,
        thumbnail: files[0],
        preview: URL.createObjectURL(files[0]),
      });
    } else {
      setVideo({ ...video, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would upload the file along with other data
    alert(
      `Video ${video.id} updated:\n${JSON.stringify(
        {
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail?.name,
        },
        null,
        2,
      )}`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-6">Edit Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thumbnail Preview */}
          <div>
            {video.preview && (
              <img
                src={video.preview}
                alt="Thumbnail"
                className="w-full h-48 object-cover rounded-md mb-3"
              />
            )}
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={video.title}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={video.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
