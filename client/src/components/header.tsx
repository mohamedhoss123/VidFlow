import { Avatar } from "@radix-ui/react-avatar";
import { Video } from "lucide-react";
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import userImage from "~/app/assets/avatar.png"

export default function Header() {
  return (
    <header className="flex items-center justify-between px-15 py-5">
      <nav className="flex items-center justify-between w-full">

        <div className="flex gap-1 items-center">
          <Video />

          <span className="text-xl font-bold">VidFlow</span>
        </div>

        <ul className="flex gap-4 items-center">
          <li>

          </li>
          <li>

          </li>
          <li>

          </li>
        </ul>
      <Image className="rounded-full" src={userImage} alt="user" width={40} height={40} />
      </nav>
    </header>
  );
}
