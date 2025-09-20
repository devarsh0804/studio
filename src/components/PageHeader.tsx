
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

export function PageHeader() {
  const pathname = usePathname();
  // Don't show header on the main homepage
  if (pathname === "/") {
      return null;
  }

  return null; // The header is now part of the (roles) layout
}
