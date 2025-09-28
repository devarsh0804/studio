
"use client";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-16 h-16", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.97 20C10.99 20 10.05 19.82 9.17 19.5C9.59 18.25 10.58 17.69 12.02 17.69C13.53 17.69 14.54 18.29 14.9 19.57C14.01 19.85 13.02 20.02 12.02 20.02L11.97 20Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19.5 9.16998C19.82 10.05 20 10.99 20 11.97C20 13.02 19.82 14.01 19.5 14.89C18.25 14.47 17.69 13.48 17.69 12.04C17.69 10.53 18.29 9.52998 19.57 9.15998L19.5 9.16998Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 14.89C4.18 14.01 4 13.02 4 12C4 10.99 4.18 10.05 4.5 9.17C5.75 9.59 6.31 10.58 6.31 12.02C6.31 13.53 5.71 14.54 4.43 14.91L4.5 14.89Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.9 4.43C14.01 4.15 13.02 3.98 12.02 3.98L11.97 4C10.99 4 10.05 4.18 9.17 4.5C9.59 5.75 10.58 6.31 12.02 6.31C13.53 6.31 14.54 5.71 14.9 4.43Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.41 6.31C15.06 6.91 14.65 7.46 14.18 7.94C13.71 8.41 13.16 8.82 12.56 9.17C11.96 9.52 11.3 9.77 10.61 9.94C10.61 9.94 10.61 9.94 10.6 9.94C10.03 9.76 9.51001 9.47 9.07001 9.07C8.11001 8.11 7.69001 6.85 8.00001 5.59C8.00001 5.59 8.00001 5.59 8.01001 5.58C8.18 4.89 8.43 4.23 8.78 3.63" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
