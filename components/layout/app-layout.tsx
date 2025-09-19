import type React from "react"

import { Navbar } from "./navbar"
import { Toaster } from "@/components/ui/toaster"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <Toaster />
    </div>
  )
}
