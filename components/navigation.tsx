"use client"
import * as React from "react"
import { cn } from "@/app/libs/utils"
import Link from "next/link"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, ChevronDown, ExternalLink, Home, Calendar, User, Settings, LogOut, LogIn, CreditCardIcon, FileEdit } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import EventsMenu from "./EventsMenu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getUser()

    // Add scroll listener for navbar effects
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (href: string) => {
    setOpen(false)
    setSheetOpen(false)
    router.push(href)
  }

  const isActive = (path: string) => {
    if (path === '/') return pathname === path
    return pathname?.startsWith(path)
  }

  const NavigationItems = () => (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="hidden lg:flex items-center gap-2">
        <Link 
          href="/" 
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive('/') 
              ? "bg-white/20 text-white" 
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          Home
        </Link>

        <Link 
          href="/dashboard/events" 
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive('/dashboard/events') 
              ? "bg-white/20 text-white" 
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          Events
        </Link>

        <Link 
          href="/events/pricing" 
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive('/events/pricing') 
              ? "bg-white/20 text-white" 
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          Pricing
        </Link>

        <Link 
          href="/team-behind-spectrum" 
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors",
            isActive('/team-behind-spectrum') 
              ? "bg-white/20 text-white" 
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          Team
        </Link>
      </div>

      <div className="lg:hidden">
        <EventsMenu />
      </div>
      
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 text-white bg-white/10 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40 flex items-center gap-1">
              <span>Explore</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Event Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="grid grid-cols-1 gap-1">
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/e-paradox" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">E paradox&apos; 25</span>
                    <span className="text-xs text-gray-500">Find clues, crack codes, win prizes</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/blindcoding" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Blind Coding&apos; 25</span>
                    <span className="text-xs text-gray-500">Based on knowledge of Basic Programming concepts</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/brain-dasher" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Brain Dasher&apos; 25</span>
                    <span className="text-xs text-gray-500">Quick thinking quiz</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/treasure-hunt" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Tech Treasure Hunt&apos; 25</span>
                    <span className="text-xs text-gray-500">Hunt for treasures</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/chem-prastuti" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Chem Prastuti&apos; 25</span>
                    <span className="text-xs text-gray-500">Chemical engineering presentations</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/bottle-rocket" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Water Rocket&apos; 25</span>
                    <span className="text-xs text-gray-500">Build & launch water rockets</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/debate" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-300"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">War of Words&apos; 25</span>
                    <span className="text-xs text-gray-500">Debate competition</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/video-games" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">High Ping &apos;25</span>
                    <span className="text-xs text-gray-500">Gaming tournament</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/3d-modelling" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#11b9a8]"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Model Making &apos;25</span>
                    <span className="text-xs text-gray-500">Build 3D Models from Scratch</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                <Link href="/events/sharktank" className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f4a141]"></span>
                  <div className="flex flex-col">
                    <span className="font-medium">Shark Tank &apos;25</span>
                    <span className="text-xs text-gray-500">Mock Shark Tank</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-primary" onClick={() => setSheetOpen(false)}>
                <Link href="/dashboard/events">
                  <span className="flex items-center justify-between w-full">
                    <span>View All Events</span>
                    <Calendar className="h-4 w-4" />
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!loading && (
        <>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 overflow-hidden bg-white/10 hover:bg-white/20 hover:text-white">
                  {user.profile?.avatar_url ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.profile.avatar_url}
                        alt={user.profile?.full_name || "User profile"}
                      />
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user.profile?.full_name ? user.profile.full_name : 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                  <Link href="/dashboard/events/registrations" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>My Registrations</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                  <Link href="/dashboard/certificates" className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Certificates</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onClick={() => setSheetOpen(false)}>
                  <Link href="/dashboard/feedback" className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    <span>Feedback</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </>
      )}
    </div>
  )

  const MobileNavigationItems = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b pb-6">
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png" 
            alt="Spectrum logo"
            className="object-contain"
          />
        </Avatar>
        <div>
          <h3 className="font-semibold">Spectrum 2025</h3>
          <p className="text-sm text-muted-foreground">Technical Festival</p>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium text-muted-foreground px-2 mb-3">QUICK LINKS</h4>
        
        <Link 
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
            isActive('/') ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => setSheetOpen(false)}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        
        <Link 
          href="/dashboard/events"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
            isActive('/dashboard/events') ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => setSheetOpen(false)}
        >
          <Calendar className="h-4 w-4" />
          <span>All Events</span>
        </Link>
        
        <Link 
          href="/events/pricing"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
            isActive('/events/pricing') ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => setSheetOpen(false)}
        >
          <ExternalLink className="h-4 w-4" />
          <span>Event Pricing</span>
        </Link>
        
        <Link 
          href="/team-behind-spectrum"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
            isActive('/team-behind-spectrum') ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => setSheetOpen(false)}
        >
          <User className="h-4 w-4" />
          <span>Team</span>
        </Link>
      </div>

      <div className="space-y-3 mt-2">
        <h4 className="text-sm font-medium text-muted-foreground px-2 mb-3">EVENTS</h4>
        <EventsMenu />
      </div>

      {!loading && (
        <div className="mt-auto border-t pt-6 space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground px-2">ACCOUNT</h4>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.profile?.avatar_url || ""}
                    alt={user.profile?.full_name || "User profile"}
                  />
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.profile?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              
              <Link 
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md w-full hover:bg-accent/50 transition-colors"
                onClick={() => setSheetOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md w-full hover:bg-accent/50 transition-colors"
                onClick={() => setSheetOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              
              <Link 
                href="/auth/signout"
                className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => setSheetOpen(false)}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                asChild 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => setSheetOpen(false)}
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-black/80 backdrop-blur-lg shadow-md" 
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Avatar className="w-20 h-20 md:w-24 md:h-24">
              <AvatarImage 
                width="256" 
                height="256" 
                src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png" 
                alt="Spectrum logo"
                className="object-contain scale-150"
              />
            </Avatar>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <NavigationItems />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-white/90 hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                  <VisuallyHidden>Open menu</VisuallyHidden>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[350px] flex flex-col h-full overflow-y-auto"
              >
                <MobileNavigationItems />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navigation