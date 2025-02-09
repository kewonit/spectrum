import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function RulesBGMI() {
    return (
      <div className="w-full text-white">
        {/* <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Rules of BGMI Tournament
        </h1> */}
        <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
          Squad-based Battle Royale Tournament
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
      title: "Team Composition & Requirements",
      description: "Essential requirements for participating teams:",
      rules: [
        "Teams must have 4 main players and up to 2 substitutes",
        "All players must have minimum account level of 30",
        "Death replay must be enabled for all players",
        "Teams must join match lobby 15 minutes before start time",
      ]
    },
    {
      title: "Match Format",
      description: "Tournament structure and gameplay settings:",
      rules: [
        "Matches will be played in TPP (Third Person Perspective) mode",
        "Standard BGMI match format will be followed",
        "Scoring system will be announced before tournament",
        "Team with highest total points wins the tournament",
        "Match results will be published after each game"
      ]
    },
    {
      title: "Fair Play & Conduct",
      description: "Rules ensuring fair competition and sportsmanship:",
      rules: [
        "Zero tolerance policy for cheats, hacks, or exploits",
        "Players must maintain respectful behavior",
        "Technical issues must be reported immediately",
        "Tournament officials' decisions are final",
        "Violation of rules results in immediate disqualification"
      ]
    },
    {
      title: "Substitutions & Reporting",
      description: "Guidelines for team changes and match documentation:",
      rules: [
        "Substitutes can be used between matches only",
        "All technical issues must be reported immediately after the match",
        "Keep match screenshots for verification",
        "Report any suspicious behavior to tournament officials",
        "Teams must follow official tournament communication channels"
      ]
    }
  ];