"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarImage  } from "@/components/ui/avatar"
import Link from "next/link"
import { Button } from "./ui/button"

export function Navigation() {
  return (
    <NavigationMenu className="">
      <Link className="mx-auto max-w-7xl flex flex-1 justify-items-start" href="/">
        <Avatar>
          <AvatarImage width="auto" height="100" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png"  alt="main logo"/>
        </Avatar>
      </Link>
        <NavigationMenuList>
        <NavigationMenuItem>
            <NavigationMenuTrigger className="text-white">Events</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="p-10 md:w-[350px] space-y-2">
                <ListItem href="/e-paradox" title="E paradox' 25" className="bg-red-500 text-gray-900">
                  <p className="text-gray-100"> A fun activity-based game in which you must find the clues and lead forward to the ultimate prize by cracking codes.  </p>
                </ListItem>
                <ListItem href="/blindcoding" title="Blind Coding' 25" className="bg-orange-500 text-gray-900">
                  <p className="text-gray-100"> Blind Coding is based on knowledge of Basic Programming concepts </p>
                </ListItem>
                <ListItem href="/brain-dasher" title="Brain Dasher' 25" className="bg-yellow-400 text-gray-900">
                  <p className="text-gray-100"> Its time to put your brain to the test! </p>
                </ListItem>
                <ListItem href="/treasure-hunt" title="Treasure Hunt' 25" className="bg-green-400 text-gray-900">
                  <p className="text-gray-100"> Treasure Hunt </p>
                </ListItem>
                <ListItem href="/chem-prastuti" title="Chem Prastuti' 25" className="bg-blue-400 text-gray-900">
                  <p className="text-gray-100"> A Chemistry presentation event! </p>
                </ListItem>
                <ListItem href="/bottle-rocket" title="Water Rocket' 25" className="bg-purple-400 text-gray-900">
                  <p className="text-gray-100"> A rocket propelled by water and air pressure! </p>
                </ListItem>
                <ListItem href="/debate" title="War of Words' 25" className="bg-pink-300 text-gray-900">
                  <p className="text-gray-100">  War of Words - Debate Competition 2025 </p>
                </ListItem>
                <ListItem href="/video-games" title="High Ping '25" className="bg-[#11b9a8] text-gray-900">
                  <p className="text-gray-100"> A gaming event </p>
                </ListItem>
                <ListItem href="/video-games" title="Shark Tank '25" className="bg-blue-400 text-gray-900">
                  <p className="text-gray-100"> An event to mock Shark Tank and Pitch Businesses </p>
                </ListItem><ListItem href="/video-games" title="Model Making '25" className="bg-[#f4a141] text-gray-900">
                  <p className="text-gray-100"> Build 3D Models from scratch and win prizes! </p>
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button><a href="/team-behind-spectrum">Team</a></Button>
          </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
  )
}
 
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          href="/" 
          {...props}
        >
          <div className="z-20 font-medium text-md leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
export default Navigation;

ListItem.displayName = "ListItem"