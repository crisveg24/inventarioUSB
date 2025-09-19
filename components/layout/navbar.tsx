"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { logout } from "@/lib/auth"
import { BarChart3, Package, Menu, LogOut, Home, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Ver Inventario",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: BarChart3,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, getUserRoleInfo } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">USBBOG Inventarios</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("flex items-center space-x-2", isActive && "bg-secondary text-secondary-foreground")}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{getUserRoleInfo()?.name}</div>
                </div>
              </div>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-card border-border">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 pb-4 border-b border-border">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-foreground">USBBOG</span>
                      {user && (
                        <div className="text-xs text-muted-foreground">
                          {user.username} | {getUserRoleInfo()?.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start flex items-center space-x-2",
                            isActive && "bg-secondary text-secondary-foreground",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    )
                  })}

                  <div className="pt-4 border-t border-border">
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
