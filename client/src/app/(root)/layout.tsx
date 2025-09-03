import Header from "~/components/header";
import Sidebar from "~/components/root/sidebar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1  p-4">{children}</main>
        </div>
      </div>
    </>
  );
}
