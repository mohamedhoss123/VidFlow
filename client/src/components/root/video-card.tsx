import Link from "next/link";

export default function VideoCard({
  thumbnail = "",
  name,
  user,
  length,
  id,
}: {
  thumbnail: string;
  name: string;
  user: { name: string; id: string };
  length: number; // in seconds,
  id: string;
}) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Link href={`/watch/${id}`}>
      <div className="flex flex-col gap-3 pb-3 w-[500px]">
        <div
          className="relative w-full aspect-video bg-center bg-cover rounded-lg"
          // style={{ backgroundImage: `url(${thumbnail})` }}
          style={{
            backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuC5R8euPuiZTWTUy_iQ04CW88_hiUXHfvfR22Tpcaj97yX0VejOuHxbLmWFOpGhMg0eBJSgp5pvqa-wug5DkEkRqxeqeRjEoURnpf6SNoh95WIMuUGI_Zwic3qyZpSHBuu16fgSrZj0tGBAq5NgmVjb8XUEIIRciAB7pZO8YHARDCSsL7i6kVLjQBVwvYchocBlHctBVY7uXyr0afXJK3qGs1JebRZgnTmNvxTj5votgEGSni-Ik4JAUYqcfuNJvU0h6XovqJhJYsdQ)`,
          }}
        >
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatTime(length)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} // replace with your video thumbnail or channel image
            alt={name}
            className="w-10 h-10 rounded-md object-cover z-10"
          />
          <div className="flex flex-col">
            <p className="text-base font-medium text-[#141414]">{name}</p>
            <p className="text-sm text-neutral-500">{user.name}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
