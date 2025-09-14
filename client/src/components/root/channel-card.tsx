import Link from "next/link";

export default function ChannelCard({
  name,
  image,
  id,
}: {
  name: string;
  image: string;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-4 text-center min-w-32 pt-4">
      <Link href={`http://localhost:8000/channel/${id}`}>
        <img
          src={image}
          alt={name}
          className="rounded-full w-full aspect-square object-cover"
        />
        <p className="text-[#141414] text-base font-medium">{name}</p>
      </Link>
    </div>
  );
}
