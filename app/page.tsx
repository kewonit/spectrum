import Image from "next/image";
import React from "react";
import Hero from "@/components/hero";
import Cards from "@/components/cards";
import Link from 'next/link';
import { EmblaOptionsType } from "embla-carousel";
import "@/components/parallax/embla.css";
import EmblaCarousels from "@/components/thumbs/EmblaCarousels";

export default function Home() {
  return (
    <main className="overflow-hidden overflow-x-hidden ">
      <div className="text-center bg-gradient-to-b from-black via-black to-gray-900 grid-background relative">
        <div className="max-w-6xl mx-auto px-4 pt-20">
          <div className="space-y-0">
            <p className="text-xs sm:text-sm md:text-base font-light tracking-wider text-gray-300">
              PCET&apos;s{" "}
              <span className="text-red-500 font-medium">PIMPRI</span> CHINCHWAD
              COLLEGE OF ENGINEERING, PUNE
            </p>
            <p className="text-xs sm:text-sm md:text-base font-light tracking-wider text-gray-400">
              Department of{" "}
              <span className="text-red-500 font-medium">Applied Sciences</span>{" "}
              and Humanities presents
            </p>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tight antialiased spectrum-title">
            SPECTRUM&apos;25
          </h1>
        </div>
      </div>
      <Hero />
      <hr />
      <h1 className="scroll-m-20 text-center text-4xl text-white font-extrabold tracking-tight lg:text-5xl p-8">
        Events{" "}
        <Image
          className="mx-auto pb-8 display: inline items-center"
          width="80"
          height="80"
          alt="image"
          src="https://i.postimg.cc/05F06hZb/zOrZlKk.png"
        />
      </h1>
      <hr />
      <Cards />
      <div className="bg-[#EBE9E0] text-black pb-16">
        {" "}
        {/* Added pb-16 for bottom padding */}
        <div className="pt-2">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl p-4">
            Glimpse of Spectrum &apos;24{" "}
            <Image
              className="mx-auto pb-8 display: inline"
              width="70"
              height="70"
              alt="image"
              src="https://i.postimg.cc/sgDXDk2X/zOrZlKk.png"
            />
          </h1>
          <hr className="border-2 border-gray-400" />
          <div className="columns-2 sm:columns-3 gap-4 my-8 mx-auto max-w-4xl pt-16 px-4">
            <div className="relative h-40 mb-4">
              <Image
                alt="A picture of the team"
                src="https://i.postimg.cc/d1cBfkzn/c28b1c81-0843-4095-9c54-c40340b96c16.jpg"
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
                src="https://i.postimg.cc/Njz2JKKV/6339615e-b3bb-4ba1-8f5c-91bbfc3eadfa.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-40 mb-4">
              <Image
                alt="Robo Race cards kept in a pile at spectrum 2023"
                src="https://i.postimg.cc/Pf7Gqh8H/a94f7af9-164e-45d7-9a5e-8f9932261ae5.jpg"
                fill
                sizes="(max-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
            <div className="relative h-80">
              <Image
                alt="My badge on top of a pile of badges from a Vercel meetup we held"
                src="https://i.postimg.cc/JzkR80TS/IMG-9273.jpg"
                fill
                sizes="(min-width: 768px) 213px, 33vw"
                className="rounded-lg object-cover"
              />
            </div>
          </div>




          <div className="rounded-3xl mx-[20px] md:mx-auto bg-white/10 p-12 shadow-2xl max-w-4xl ">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-black">Meet Our Previous Team</h3>
              <p className="mt-4 text-lg text-black-200">Last year&apos;s Spectrum Pccoe&apos;24 team members</p>
            </div>
            <Link
              href="/2024"
              className="group flex items-center gap-4 rounded-full bg-black/20 px-8 py-4 text-lg text-black transition-all hover:bg-white/30"
            >
              <span>View 2024 Team</span>
              <svg
                className="h-6 w-6 transition-transform group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
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
