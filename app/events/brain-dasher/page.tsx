import { Rules } from "@/app/events/brain-dasher/components/accordian"
import { BrainDashers_registarion } from "@/app/events/brain-dasher/components/registration";
import { Krona_One } from 'next/font/google'
import Image from "next/image";

import { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Spectrum x Brain Dasher',
  description: "Tech event for first year students",  
  openGraph: {
    title: 'Spectrum x Brain Dasher',
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
        Brain Dasher 
        </h1>
        <br/>
        <h2 className="font-jacques_francois_shadow scroll-m-20 pl-2 text-2xl font-extrabold text-gray-800 tracking-tight lg:text-5xl">
          brought to you by AS&H, PCCOE
        </h2>
      </div>
      <picture> 
        <img className="mx-auto mt-4" width="600" height="450" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931688/Spectrum/shapes/MJ4C1aA-min_z9q3gr.png" />
      </picture> 
      <div>
      <h3 className="font-jacques_francois_shadow text-center scroll-m-20 my-6 pl-2 text-xl font-extrabold text-gray-800 tracking-tight md:text-3xl lg:text-5xl">
       It&apos;s time to put your brain to the test!
      </h3>
      </div>
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <BrainDashers_registarion />
      <picture> 
        <img className="mx-auto my-16" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <Rules /> 
    <hr/>
      <picture> 
        <img className="mx-auto my-8" width="800" height="50" alt="image" src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705931875/Spectrum/global/lbNfJM2-min_n0yrof.webp" />
      </picture> 
      <div className="text-gray-700 leading-7 mb-4 p-2 lg:p-8">
    <h1>Rules and Regulations of the events: </h1>
      <p className="leading-7">
      1. Total 15 questions will be asked.. <br/>
      2. If the question is related to an established word/ proverb/ or a saying, participant need to 
answer perfectly. Or else no point would be awarded.<br/>
      3. Negative marking is applicable for the participant pressing the buzzer and not answering even  
after 5 secs. 
<br/>
      4. If there&apos;s a tie, another set of 5 difficult question (with varying points) will be displayed and 
accordingly, the winner would be selected. 
      </p>
      <h1 className="pt-8">Judging Criteria:</h1>
      <p className="leading-7">
      1. Sumbission Time <br/>
      2. Correct Answers
      </p>
    </div>
    </main>
  );

}