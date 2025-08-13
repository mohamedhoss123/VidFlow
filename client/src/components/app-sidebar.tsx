import { ChartSpline, TvMinimalPlay, Upload } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function AppSidebar() {
  return (
    <aside className="flex flex-col w-60 gap-2 h-screen text-start p-4">
      <Button asChild variant="ghost" className="justify-start ">
        <Link href="/upload"><Upload /> Upload </Link>
      </Button>
      <Button asChild variant="ghost" className="justify-start ">
        <Link href="/video"><TvMinimalPlay /> My Videos </Link>
      </Button>
      <Button asChild variant="ghost" className="justify-start ">
        <Link href="/explore"><ChartSpline /> Statistics </Link>
      </Button>
    </aside>
  )
}