import { MainNav } from "@/components/MainNav";

export default function RolesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      {children}
    </div>
  );
}
