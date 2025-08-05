import { FilePlay } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";

export function UploadInput() {
  return (
    <label className="w-100 h-60 border relative rounded-lg border-dashed p-5 flex gap-2 flex-col items-center justify-center cursor-pointer">
      <FilePlay />
      <p className="text-muted-foreground">Drag and drop video to upload</p>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <input type="file" className="w-full h-full absolute opacity-0" aria-label="Upload" {...field} />

            </FormControl>
            <FormDescription>
              Title of the video.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

    </label>
  )
}
