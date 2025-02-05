
import { Rules } from "@/app/events/video-games/components/accordian"
import { Electrica_registarion } from "@/app/events/video-games/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
import { RulesBGMI } from "./components/bgmi";
import { RulesValo } from "./components/valorant";
import { Electrica_registarion2 } from "./components/registrationbg";
import RulesFreefire from "./components/freefire";
import { Electrica_registarion3 } from "./components/registrationff";
 
export const metadata: Metadata = {
  title: 'Spectrum x High Ping',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x High Ping',
    description: "Tech event for first year students",  
    url: "https://pccoespectrum.tech",
    siteName: "pccoespectrum.tech",
    images: [
      {
        url: "https://i.imgur.com/rmVmQ7C.png",
        width: 548,
        height: 253,
        alt: 'Image',
      },
    ],
  }, 
}

const korna = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400', 
});

export default function Home() {
  return (
    <main className="overflow-hidden max-w-7xl mx-auto px-8 bg-[#EBE9E0]">
      <div className={korna.className}>
        <h1 className="font-jacques_francois_shadow scroll-m-20 pt-8 text-4xl md:text-7xl font-extrabold text-gray-800 tracking-tight lg:text-9xl">
        High Ping&apos;25
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <Image className="mx-auto mt-4" width="500" height="450" alt="image" src="https://i.imgur.com/U42KHTH.png" />
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-4 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
      High Ping PCCOE E-Sports Event <br/>
        1) Valorant Tournament <br/>
        2) BGMI Tournament
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture>   
      <Electrica_registarion />
      <Electrica_registarion2 />
      <Electrica_registarion3 />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" /> 
      </picture> 
    <hr/>
    <div className="text-gray-700 leading-7 mb-4 p-4 lg:p-8">
      <RulesBGMI />
      <RulesValo />
      <RulesFreefire />
        {/* <h1>Note :</h1> */}
        {/* <p className="leading-7">
        1.	Each team should consist of 5 people for Valorant and 4 people for BGMI. <br/>
        2.	Leader of each team will be primary person of contact.<br/>
        3.	Usernames and Team names should not contain Vulgarities.<br/>
        4.	External gaming accessories like triggers are not allowed.<br/>
        5.  No abuse of any kind will be tolerated.<br/>
        6.  Any kind of malpractices will result in disqualification of team.<br/>
        7.	On-Spot Entries are not acceptable.<br/>
        8.	Qualifying rounds will take place in online mode, Semi-final and Final matches will be conducted offline in our college campus.
        </p> */}
        </div>
        {/* <div className="text-gray-700 leading-7 mb-4 p-4 lg:p-8"> */}
        {/* <h1>Registration Fee: </h1>
        <p className="leading-7">
          1. Valorant – Rs 500 per team <br/>
          2. BGMI – Rs 400 per team 

        </p> */}
        {/* </div> */}
    </main>
  );

}