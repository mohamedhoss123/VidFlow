export default function ChannelCard({ name, image }: { name: string; image: string }) {
    return (
    <div className="flex flex-col    gap-4 text-center min-w-32 pt-4">
      <div
        className="bg-center bg-cover rounded-full w-full aspect-square"
        style={{ backgroundImage: `url(${image})` }}
      ></div>
      <p className="text-[#141414] text-base font-medium">{name}</p>
    </div>
  );}
  