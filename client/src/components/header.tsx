import { Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import userImage from "~/app/assets/avatar.png";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-15 py-3 border-b">
      <nav className="flex items-center w-full gap-5">
        <div className="flex gap-1 items-center">
          {/* <Video /> */}

          <span className="text-xl font-bold">VidFlow</span>
        </div>

        <ul className="flex gap-5 items-center">
          <li>
            <Link href="#">Home</Link>
          </li>
          <li>
            <Link href="#">Subscriptions</Link>
          </li>
          <li>
            <Link href="#">Library</Link>
          </li>
        </ul>
        <Avatar className="ms-auto">

          <Image src={userImage}
            width={60}
            height={60}
            alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </nav>
    </header>
  );
}
