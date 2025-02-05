'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger ,DialogTitle} from "@/components/ui/dialog";
import { motion } from "framer-motion";

// Types
interface Event {
  id: number;
  href: string;
  title: string;
  description: string;

  color: string;
}
interface EventsMenuProps {
  onClose?: () => void;
}
interface EventCardProps extends Event {
  onNavigate: (href: string) => void;
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Event data
const events: Event[] = [
  { id: 1,href: "/events/e-paradox", title: "E paradox' 25", description: "Find clues, crack codes, win prizes", color: "text-red-500" },
  { id: 2,href: "/events/blindcoding", title: "Blind Coding' 25", description: "Based on knowledge of Basic Programming concepts", color: "text-orange-500" },
  { id: 3,href: "/events/brain-dasher", title: "Brain Dasher' 25", description: "Quick thinking quiz", color: "text-yellow-400" },
  { id: 4,href: "/events/treasure-hunt", title: "Treasure Hunt' 25", description: "Hunt for treasures",  color: "text-green-400" },
  { id: 5,href: "/events/chem-prastuti", title: "Chem Prastuti' 25", description: "Chemical engineering presentations", color: "text-blue-400" },
  { id: 6,href: "/events/bottle-rocket", title: "Water Rocket' 25", description: "Build & launch water rockets",  color: "text-purple-400" },
  { id: 7,href: "/events/debate", title: "War of Words' 25", description: "Debate competition",color: "text-pink-300" },
  { id: 8,href: "/events/video-games", title: "High Ping '25", description: "Gaming tournament", color: "text-blue-400" },
  { id: 9,href: "/events/3d-modelling", title: "Model Making '25", description: "Build 3D Models from Scratch", color: "text-[#11b9a8]" },
  { id: 10,href: "/events/sharktank", title: "Shark Tank '25", description: "Mock Shark Tank",  color: "text-[#f4a141]" }
];




// EventCard component
const EventCard: React.FC<EventCardProps> = ({ id,href, title, description, color, onNavigate }) => (
  <motion.div
    variants={item}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Button
      variant="ghost"
      className={`w-full h-auto py-6 rounded-xl flex flex-col items-center justify-center gap-2 
      bg-gray-50/5 backdrop-blur-sm border border-gray-200/10 
      hover:bg-gray-50/20 hover:border-gray-200/20 
      transition-all duration-300 ease-out ${color}`}
      onClick={() => onNavigate(href)}
    >
      <span className="text-lg font-medium">{title}</span>
      <p className="text-sm text-gray-400 text-center px-4">{description}</p>
      {/* <p className="text-xs text-gray-500">{date}</p> */}
    </Button>
  </motion.div>
);

// Main EventsMenu component
export default function EventsMenu({ onClose }: EventsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleNavigation = (href: string) => {
    setOpen(false);
    onClose?.();
    router.push(`${href}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 w-full md:w-24"> Events</Button>
      </DialogTrigger>
      <DialogContent className="w-full h-[100dvh] max-w-full m-0 p-0 bg-black/95 border-none overflow-y-auto">
      <DialogTitle className="sr-only">Spectrum Events 2025</DialogTitle>
        <div className="relative w-full min-h-full px-4 py-6 sm:px-6 md:px-12 lg:px-24 md:py-12">
          <Button
            variant="ghost"
            size="icon"
            className="fixed sm:absolute right-4 top-4 sm:right-6 sm:top-6 text-white hover:text-gray-300 
            transition-colors duration-300 p-2 sm:p-3 h-12 w-12 sm:h-14 sm:w-14 z-50"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6 sm:h-8 sm:w-8" />
          </Button>

          <div className="mb-8 sm:mb-12 pt-12 sm:pt-0">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Spectrum Events 2025
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-gray-400"
            >
              Join us for an exciting lineup of events
            </motion.p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24"
          >
            {events.map((event) => (
              <EventCard 
                key={event.id}
                {...event}
                onNavigate={handleNavigation}
              />
            ))}
          </motion.div>

          {/* <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative sm:absolute bottom-4 left-4 right-4 pb-6 sm:pb-0"
          >
            <p className="text-sm text-gray-400">Spectrum 2025 - Annual Technical Festival</p>
          </motion.div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}