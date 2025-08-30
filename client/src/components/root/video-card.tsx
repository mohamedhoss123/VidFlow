export default function VideoCard({ thumbnail="", name, user }: { thumbnail: string; name: string; user:{name:string} }) {
    return (
      <div className="flex flex-col gap-3 pb-3 w-[500px]">
        <div
          className="w-full aspect-video bg-center bg-cover rounded-lg"
          // style={{ backgroundImage: `url(${thumbnail})` }}
          style={{ backgroundImage: `url(https://lh3.googleusercontent.com/aida-public/AB6AXuC5R8euPuiZTWTUy_iQ04CW88_hiUXHfvfR22Tpcaj97yX0VejOuHxbLmWFOpGhMg0eBJSgp5pvqa-wug5DkEkRqxeqeRjEoURnpf6SNoh95WIMuUGI_Zwic3qyZpSHBuu16fgSrZj0tGBAq5NgmVjb8XUEIIRciAB7pZO8YHARDCSsL7i6kVLjQBVwvYchocBlHctBVY7uXyr0afXJK3qGs1JebRZgnTmNvxTj5votgEGSni-Ik4JAUYqcfuNJvU0h6XovqJhJYsdQ)` }}
        ></div>
        <div>
          <p className="text-base font-medium text-[#141414]">{name}</p>
          <p className="text-sm text-neutral-500">{user.name}</p>
        </div>
      </div>
    );
  }