import { MainNav } from "@/components/MainNav";

export default function RolesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MainNav />
      {children}
    </>
  );
}
