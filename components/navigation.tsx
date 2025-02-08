"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "./ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import EventsMenu from "./EventsMenu"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const router = useRouter()

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
  }, [])

  const handleNavigation = (href: string) => {
    setOpen(false)
    setSheetOpen(false)
    router.push(href)
  }

  const NavigationItems = () => (
    <div className="flex items-center gap-4 md:gap-6">

      <EventsMenu />



      <Button variant="outline" asChild className="h-10" onClick={() => setSheetOpen(false)}>
        <Link href="/team-behind-spectrum">Team</Link>
      </Button>

      {!loading && (
        <>
          {user ? (
            <Button asChild onClick={() => setSheetOpen(false)}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" onClick={() => setSheetOpen(false)}>
              <Link href="/login">Login</Link>
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

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground px-2">MENU</h4>
        <EventsMenu />


        <Button 
          variant="outline" 
          asChild 
          className="w-full justify-center text-base font-normal"
          onClick={() => setSheetOpen(false)}
        >
          <Link href="/team-behind-spectrum">Team</Link>
        </Button>
      </div>

      {!loading && (
        <div className="mt-auto border-t pt-6 space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground px-2">ACCOUNT</h4>
          {user ? (
            <Button 
              asChild 
              className="w-full"
              onClick={() => setSheetOpen(false)}
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                asChild 
                variant="outline" 
                className="w-full"
                onClick={() => setSheetOpen(false)}
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <nav className="relative border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Avatar className="w-32 h-32 md:w-36 md:h-36">
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
                <Button variant="ghost" size="icon" className="text-white hover:text-white/90">
                  <Menu className="h-5 w-5" />
                  <VisuallyHidden>Open menu</VisuallyHidden>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[350px] flex flex-col"
              >
                <MobileNavigationItems />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

const events = [
  { href: "/events/e-paradox", title: "E paradox' 25", bgColor: "bg-red-500", description: "Find clues, crack codes, win prizes" },
  { href: "/events/blindcoding", title: "Blind Coding' 25", bgColor: "bg-orange-500", description: "Based on knowledge of Basic Programming concepts" },
  { href: "/events/brain-dasher", title: "Brain Dasher' 25", bgColor: "bg-yellow-400", description: "Quick thinking quiz" },
  { href: "/events/treasure-hunt", title: "Treasure Hunt' 25", bgColor: "bg-green-400", description: "Hunt for treasures" },
  { href: "/events/chem-prastuti", title: "Chem Prastuti' 25", bgColor: "bg-blue-400", description: "Chemical engineering presentations" },
  { href: "/events/bottle-rocket", title: "Water Rocket' 25", bgColor: "bg-purple-400", description: "Build & launch water rockets" },
  { href: "/events/debate", title: "War of Words' 25", bgColor: "bg-pink-300", description: "Debate competition" },
  { href: "/events/video-games", title: "High Ping '25", bgColor: "bg-blue-400", description: "Gaming tournament" },
  { href: "/events/3d-modelling", title: "Model Making '25", bgColor: "bg-[#11b9a8]", description: "Build 3D Models from Scratch" },
  { href: "/events/sharktank", title: "Shark Tank '25", bgColor: "bg-[#f4a141]", description: "Mock Shark Tank" },
];

const EventsList = ({ onNavigate }: { onNavigate: (href: string) => void }) => (
  <>
    {events.map((event) => (
      <EventItem key={event.href} {...event} onNavigate={onNavigate} />
    ))}
  </>
);

const EventItem = ({ 
  href, 
  title, 
  bgColor, 
  description, 
  onNavigate 
}: { 
  href: string; 
  title: string; 
  bgColor: string; 
  description: string;
  onNavigate: (href: string) => void;
}) => (
  <button
    onClick={() => onNavigate(href)}
    className={cn(
      "block w-full text-left p-3 rounded-md hover:opacity-90",
      bgColor
    )}
    role="listitem"
    aria-label={`${title} - ${description}`}
  >
    <div className="font-medium text-gray-900">{title}</div>
    <p className="text-sm text-gray-100">{description}</p>
  </button>
)

export default Navigation