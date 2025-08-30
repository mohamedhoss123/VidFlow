"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const links = [
  { label: "Home", icon: "🏠" ,href:"/home"},
  { label: "Subscriptions", icon: "🔖" ,href:"/subscription"},
  { label: "Library", icon: "📺" ,href:"/library"},
  { label: "Settings", icon: "⚙️" ,href:"/settings"},
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-80 p-4 bg-neutral-50">
      <nav className="flex flex-col gap-2">
        {links.map((link, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              pathname === link.href ? "bg-[#ededed]" : ""
            }`}
          >
            <span>{link.icon}</span>
            <Link href={link.href} className="text-sm font-medium text-[#141414]">{link.label}</Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}