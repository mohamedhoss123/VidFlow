import { AppSidebar } from "~/components/app-sidebar";
import Header from "~/components/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="flex">
        <AppSidebar />
        <main className="container p-5 mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}
