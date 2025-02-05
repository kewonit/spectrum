import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function RulesFreefire() {
  return (
    <div className="w-full text-gray-700 p-2 sm:p-4 lg:p-8">
      <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl px-2 sm:px-4 md:px-0">
        Free Fire Tournament Rules
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Official Tournament Guidelines
      </p>

      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 md:space-y-6">
        {sections.map((section, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index + 1}`} 
            className="border-none rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 mx-1 sm:mx-2 md:mx-0"
          >
            <AccordionTrigger className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline data-[state=open]:bg-[#EBE9E0] rounded-lg shadow-md sm:rounded-xl md:rounded-2xl group transition-all duration-300 w-full">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6 w-full">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full bg-[#EBE9E0] group-data-[state=open]:bg-white text-gray-800 font-bold text-sm sm:text-base md:text-lg transition-all duration-300">
                  {index + 1}
                </span>
                <h3 className="text-sm sm:text-base md:text-xl font-semibold group-hover:text-gray-900 text-left flex-1">
                  {section.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-4">
              <div className="space-y-4 md:space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">
                  {section.description}
                </p>
                <div className="bg-[#EBE9E0] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base md:text-lg">Guidelines:</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {section.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 md:gap-3 text-gray-700">
                        <span className="font-medium min-w-[16px] md:min-w-[20px] text-sm md:text-base">
                          {idx + 1}.
                        </span>
                        <span className="leading-relaxed text-sm md:text-base">
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