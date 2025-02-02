import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function RulesValo() {
    return (
      <div className="w-full text-gray-700 p-2 sm:p-4 lg:p-8">
        <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl px-2 sm:px-4 md:px-0">
          Rules of High Ping (Valorant)
        </h1>
        <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
          5v5 Competitive Tournament for First Year Students
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
      title: "Eligibility & Registration",
      description: "Requirements for participating in the Valorant tournament:",
      rules: [
        "Only First-year students are eligible to participate",
        "Required documents: College ID and Fee receipt/JEE/CET marksheet",
        "Teams must consist of 5 players with valid Riot accounts",
        "Substitutes must be registered before tournament starts",
        "Players must arrive 30 minutes before scheduled match time"
      ]
    },
    {
      title: "Tournament Format",
      description: "Structure and progression of the tournament:",
      rules: [
        "Single elimination bracket system",
        "Group Stage: Best of 3 (Bo3) matches",
        "Semifinals & Finals: Best of 3 (Bo3) matches",
        "Competitive mode with random map selection",
        "All agents are allowed for selection"
      ]
    },
    {
      title: "Equipment & Setup",
      description: "Requirements for match participation:",
      rules: [
        "Players must bring their own peripherals (keyboard, mouse, headphones)",
        "Personal Riot accounts are mandatory",
        "Technical checks will be performed before matches",
        "Pauses only allowed for technical issues",
        "Teams must be ready 15 minutes before match time"
      ]
    },
    {
      title: "Match Rules & Conduct",
      description: "Regulations for fair play and sportsmanship:",
      rules: [
        "Zero tolerance for toxic behavior or cheating",
        "Disconnected players must rejoin ASAP",
        "10-minute no-show results in forfeit",
        "Players cannot stream their own matches",
        "Respect towards opponents and organizers is mandatory"
      ]
    },
    {
      title: "Penalties & Disqualification",
      description: "Actions that result in penalties or disqualification:",
      rules: [
        "Use of cheats or hacks results in immediate disqualification",
        "Exploitation of game bugs is prohibited",
        "Unsportsmanlike conduct leads to penalties",
        "Repeated violations result in tournament ban",
        "Tournament officials' decisions are final"
      ]
    }
  ];