import Image from "next/image";
import React from "react";
import Hero from "@/components/hero";
import Cards from "@/components/cards"; 
{ /* import EmblaCarousel from '@/components/parallax/EmblaCarousel' */}
import { EmblaOptionsType } from 'embla-carousel'
import '@/components/parallax/embla.css'
import EmblaCarousels from '@/components/thumbs/EmblaCarousels'
const OPTIONS: EmblaOptionsType = { dragFree: true }
const SLIDE_COUNT = 5
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())


export default function Home() {
  return (
    <main className="overflow-hidden overflow-x-hidden">
      <div className="text-center bg-gradient-to-b from-black via-black to-gray-900"> {/* Removed py-4 md:py-6 */}
        <div className="max-w-6xl mx-auto px-4 pt-20">
          <div className="space-y-0"> {/* Changed from space-y-1 and removed mb-1 */}
            <p className="text-xs sm:text-sm md:text-base font-light tracking-wider text-gray-300">
              PCET&apos;s <span className="text-red-500 font-medium">PIMPRI</span> CHINCHWAD COLLEGE OF ENGINEERING, PUNE
            </p>
            <p className="text-xs sm:text-sm md:text-base font-light tracking-wider text-gray-400">
              Department of <span className="text-red-500 font-medium">Applied Sciences</span> and Humanities presents
            </p>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight antialiased spectrum-title"> {/* Removed mb-2 */}
            SPECTRUM&apos;25
          </h1>
        </div>
      </div>
      <Hero/>
      <hr/>
      <h1 className="scroll-m-20 text-center text-4xl text-white font-extrabold tracking-tight lg:text-5xl p-8">
        Events <Image className="mx-auto pb-8 display: inline items-center" width="80" height="80" alt="image" src="https://i.postimg.cc/05F06hZb/zOrZlKk.png" />
      </h1>
      <hr/>
      <Cards />
      <div className="bg-[#EBE9E0] text-black">
        <div className="pt-2">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl p-4">
            Glimpse of Spectrum &apos;24 <Image className="mx-auto pb-8 display: inline" width="70" height="70" alt="image" src="https://i.postimg.cc/sgDXDk2X/zOrZlKk.png" />
          </h1>
          <hr className="border-2 border-gray-400"/>
          <div className="columns-2 sm:columns-3 gap-4 my-8 mx-auto max-w-4xl pt-16 px-4">
            <div className="relative h-40 mb-4">
              <Image
                alt="A picture of the team"
                src="https://i.imgur.com/cBNoOE9.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-80 mb-4 sm:mb-0">
              <Image
                alt="A man looking at a robot a spectrum 2023"
                src="https://i.imgur.com/escfJ52.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover  sm:object-center"
              />
            </div>
            <div className="relative h-40 sm:h-80 sm:mb-4">
              <Image
                alt="A robo race in action at spectrum 2023"
                src="https://i.postimg.cc/XYVB0qhB/Twchtreasurehunt.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover object-top sm:object-center"
              />
            </div>
            <div className="relative h-40 mb-4 sm:mb-0">
              <Image
                alt="A minature plane kept on display at spectrum 2023"
                src="https://i.imgur.com/z1nMI5p.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-40 mb-4">
              <Image
                alt="Robo Race cards kept in a pile at spectrum 2023"
                src="https://i.imgur.com/ChxIC6v.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-80">
              <Image
                alt="My badge on top of a pile of badges from a Vercel meetup we held"
                src="https://i.imgur.com/jM0tA67.jpg"
                fill
                sizes="(min-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
        {/* <section className="sandbox__carousel">
              <EmblaCarousels slides={SLIDES} options={OPTIONS} />
            </section> */}
        {/* <div className="pt-16">
          <hr className="border-2 border-gray-400"/>
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl p-8">
              Events for Spectrum&apos;24 <Image className="mx-auto pb-8 display: inline" width="70" height="70" alt="image" src="https://i.imgur.com/zOrZlKk.png" />
            </h1>
          <hr className="border-2 border-gray-400"/>
        </div>
        <section className="sandbox__carousel">
          <EmblaCarousels slides={SLIDES} options={OPTIONS} />
        </section> */}
      </div>
    </main>
  );
}
