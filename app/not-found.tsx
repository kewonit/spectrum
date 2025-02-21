import Link from 'next/link'
import Image from "next/image";
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md p-8 bg-black/50 rounded-lg border border-gray-800 shadow-xl backdrop-blur-sm">
        <Image className="mx-auto pt-4 animate-pulse" width="200" height="200" alt="image" src="https://i.imgur.com/3yshaEp.png" />
        <h2 className="text-3xl font-bold mb-4 text-white text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Page Not Found
        </h2>
        <p className="text-gray-300 mb-6 text-center">
          404! This page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <p className="text-gray-300 mb-6 text-center">
          Try contacting us at{' '}
          <a href="mailto:pccoe.spectrum.25@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            pccoe.spectrum.25@gmail.com
          </a>
          , or go back to the home page.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="secondary">
              Return Home
            </Button>
          </Link>
        </div>
        <p className="text-gray-400 mt-6 text-center">
          <Link 
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
            className="hover:text-gray-200 transition-colors underline decoration-dotted"
          >
            Otherwise, for cute dogs pics, click here
          </Link>
        </p>
      </div>
    </div>
  )
}