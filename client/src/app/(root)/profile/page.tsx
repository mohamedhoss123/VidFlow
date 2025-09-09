"use client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

export default function ChannelSettingsPage() {
  const [name, setName] = useState("My Channel");
  const [description, setDescription] = useState(
    "Welcome to my channel! Here I share videos about tech, coding, and more.",
  );
  const [avatar, setAvatar] = useState<string>("/default-avatar.png");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setNewAvatar(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const applyAvatar = () => {
    if (preview) setAvatar(preview);
    setDialogOpen(false);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (newAvatar) formData.append("avatar", newAvatar);

    // fetch("/api/channel/update", { method: "POST", body: formData })
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl shadow-md">
        <div className="absolute bottom-[-50px] left-8">
          <div className="relative">
            <img
              src={avatar}
              alt="Channel avatar"
              className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover cursor-pointer"
              onClick={() => setDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            ) : (
              <img
                src={avatar}
                alt="Current avatar"
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyAvatar}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Form */}
      <div className="mt-16">
        <Card className="shadow-md">
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Channel Name
              </label>
              <Input
                className="text-lg"
                placeholder="Enter channel name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Channel Description
              </label>
              <Textarea
                className="min-h-[120px]"
                placeholder="Tell viewers about your channel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="px-6 py-2 text-base">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
