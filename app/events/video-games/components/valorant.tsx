import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function RulesValo() {
    return (
      <div className="w-full text-white">
        {/* <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Rules of High Ping (Valorant)
        </h1> */}
        <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
          5v5 Competitive Tournament for First Year Students
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