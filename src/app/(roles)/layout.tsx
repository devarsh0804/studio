import { MainNav } from "@/components/MainNav";
import { ReactNode } from "react";

export default function RolesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MainNav />
      {children}
    </>
  )
}
