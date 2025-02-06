import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Rules() {
  return (
    <div className="w-full text-gray-700 p-2 sm:p-4 lg:p-8">
      <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl px-2 sm:px-4 md:px-0">
        Rules of Treasure Hunt
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Total 3 rounds
      </p>

      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 md:space-y-6">
        {rounds.map((round, index) => (
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
                  {round.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-4">
              <div className="space-y-4 md:space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">
                  {round.description}
                </p>
                <div className="bg-[#EBE9E0] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base md:text-lg">Rules:</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {round.rules.map((rule, idx) => (
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

const rounds = [
  {
    title: "ROUND 1: Aptitude Test",
    description: "A quick 15-minute assessment of your logical reasoning and English language skills. No coding knowledge required for any rounds of this competition.",
    rules: [
      "Test duration is 15 minutes",
      "Questions will focus on logical reasoning and English",
      "No technical or coding knowledge required",
      "Top performers will qualify for Round 2"
    ]
  },
  {
    title: "ROUND 2: Mystery Mania",
    description: "Step into the world of mystery in Mystery Mania, where puzzling photos await! Use your observation skills and deductive reasoning to uncover hidden clues and solve visual mysteries.",
    rules: [
      "Participants must analyze mysterious photographs to find clues",
      "Time limit will be enforced for each puzzle",
      "Points awarded based on accuracy and speed of solving",
      "Team collaboration may be required for certain challenges",
      "Qualified teams advance to the final treasure hunt"
    ]
  },
  {
    title: "ROUND 3: The Final Hunt",
    description: "Whispers of fortune guide your path in this ultimate challenge. Navigate through a series of puzzles and physical challenges, including an exciting laser maze obstacle course, to claim the final prize.",
    rules: [
      "Teams must solve interconnected puzzles to progress",
      "Time limits apply for each section of the hunt",
      "Physical activity will be required - wear appropriate clothing",
      "Follow all safety instructions for the laser maze",
      "First team to complete all challenges and find the treasure wins"
    ]
  }
];