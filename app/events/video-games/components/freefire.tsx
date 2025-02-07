import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function RulesFreefire() {
  return (
    <div className="w-full text-white">
      {/* <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Free Fire Tournament Rules
      </h1> */}
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Official Tournament Guidelines
      </p>

      <Accordion type="single" collapsible className="space-y-4">
        {sections.map((section, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index + 1}`} 
            className="border-none rounded-xl bg-white/10 backdrop-blur-lg transition-all duration-300"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/15 rounded-xl transition-all duration-300 w-full">
              <div className="flex items-center gap-6 w-full">
                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white font-bold text-lg">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-left flex-1">
                  {section.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-4">
              <div className="space-y-6">
                <p className="text-white/80 leading-relaxed text-lg">
                  {section.description}
                </p>
                <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Guidelines:</h4>
                  <ul className="space-y-3">
                    {section.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="font-medium min-w-[20px]">
                          {idx + 1}.
                        </span>
                        <span className="leading-relaxed text-white/90">
                          {rule}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

const sections = [
  {
    title: "Registration & Eligibility",
    description: "Essential requirements for tournament participation:",
    rules: [
      "All players must be at least Level 10 to participate",
      "Players must use their own accounts with unique survivor names",
      "Only smartphones running Android or iOS are allowed - no emulators, tablets, triggers or other devices",
      "Players cannot switch accounts during the tournament",
      "Teams must join 10 minutes before scheduled time or risk disqualification"
    ]
  },
  {
    title: "Tournament Rules",
    description: "Official tournament guidelines and compliance:",
    rules: [
      "All players must comply with tournament rules and staff decisions",
      "Ignorance of rules is not an acceptable excuse for violations", 
      "Tournament staff decisions are final and binding",
      "For LAN events, players must bring their own peripherals (headsets, battery packs)",
      "No rank requirements are imposed for registration"
    ]
  },
  {
    title: "Fair Play",
    description: "Guidelines ensuring fair competition:",
    rules: [
      "Use of hacks, cheats, or exploits will result in immediate disqualification",
      "Players must maintain respectful behavior throughout the tournament",
      "Report suspicious behavior or technical issues immediately",
      "Follow official tournament communication channels",
      "Teams must comply with all match scheduling and timing requirements"
    ]
  },
  {
    title: "Technical Requirements",
    description: "Device and technical specifications:",
    rules: [
      "Only smartphones are permitted - no PCs, consoles, or tablets",
      "Official emulators are not allowed under any circumstances",
      "Devices must run on either Android or iOS operating systems",
      "External triggers or unauthorized peripherals are prohibited",
      "Players are responsible for their device's performance and connectivity"
    ]
  }
];

export default RulesFreefire;