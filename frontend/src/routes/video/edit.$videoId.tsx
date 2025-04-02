import "react"
import { createFileRoute } from '@tanstack/react-router'

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';


export const Route = createFileRoute('/video/edit/$videoId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <EditVideoPage></EditVideoPage>
  )
}

function EditVideoPage() {
  const [thumbnail, setThumbnail] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ thumbnail, name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[50rem]">
      <div className="flex flex-col items-right space-x-2">
        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
          Thumbnail URL
        </label>
        <input
          id="thumbnail"
          type="file"
          value={thumbnail}
          onChange={(e) => setThumbnail((e.target as HTMLInputElement).value)}
          className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
}

