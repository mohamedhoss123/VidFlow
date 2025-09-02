"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
export default function Header() {
  const router = useRouter();
  const logout = () => {
    // Remove JWT from localStorage or cookies
    localStorage.removeItem("token"); // if stored in localStorage

    // Redirect to login page
    router.push("/login");
  };
  return (
    <header className="flex items-center justify-between border-b border-[#ededed] px-10 py-3">
      {/* Logo */}
      <div className="flex items-center gap-4 text-[#141414]">
        <div className="size-4">
          <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"></path>
          </svg>
        </div>
        <h2 className="text-lg font-bold">Streamr</h2>
      </div>

      {/* Right side */}
      <div className="flex flex-1 justify-end gap-8">
        {/* Search */}
        <label className="flex min-w-40 max-w-64 h-10">
          <div className="flex w-full items-stretch rounded-lg h-full">
            <div className="flex items-center justify-center pl-4 bg-[#ededed] rounded-l-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              placeholder="Search"
              className="form-input flex-1 bg-[#ededed] px-4 rounded-r-lg text-base text-[#141414] placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </label>

        {/* Upload */}
        <button className="flex items-center gap-2 h-10 px-2.5 rounded-lg bg-[#ededed] font-bold text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32Z"></path>
          </svg>
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="bg-center bg-cover rounded-full size-10 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHoMqRw2ohBAnAEeD2HOcRltERHKJC9coF5G3aMcmNn-9pvmSwtpJErBHhdnX-31buDG9KnzMmrEC45d9-G3NiwM-d8u3I_IEASKBB6f4qlgnw-xTgv2wm5RFnhcUNJTsDqP-ZfIeU_U0jqbHsqG8LW9T4NdQOjAZb7M7eYLALyLLlX991teaLHZujUKIxBMESTOqbP_kYGVLax4V0NC2YyemPrBpxDdRqyPGgB0U4jbyVq0ixJiNrQIMT3JTNivokrJJEvHFGT5-z')",
              }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Send Message</DropdownMenuItem>
            <DropdownMenuItem>
              {" "}
              <Link href="/studio">Studio</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              <p onClick={logout}>Logout</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
