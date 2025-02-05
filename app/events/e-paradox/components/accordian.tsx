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
        Rules of E-Paradox
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Total 4 rounds
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
    title: "ROUND 1: Quick Code Quest",
    description: "This round features three sections: Basic Programming Questions, Basic Coding Theory Questions, and Coding Questions. Participants will showcase their programming skills, tackling theoretical concepts and hands-on challenges. The round is conducted offline, with the link provided a day before the event.",
    rules: [
      "This will be held on Google Form Platform.",
      "Overall time limit for this round will be 20 minutes for each candidate",
      "Top 90 amongst all the candidates will appear for round 2 and others will be eliminated"
    ]
  },
  {
    title: "ROUND 2: Odd Function Out",
    description: "Participants will receive a Hackerrank contest link the day before the event. Inside, there are three coding questions. Your task is to choose and solve any two questions that align with your coding strengths.",
    rules: [
      "This will be held on Hacker rank Platform.",
      "Overall time limit for this round will be 10 minutes for each candidate.",
      "3 problem statements will be provided. Participants will have to solve any two amongst those three statements.",
      "Top 40 amongst all the candidates will appear for round 3 and others will be eliminated"
    ]
  },
  {
    title: "ROUND 3: Into the Unknown",
    description: "A single problem statement will be presented to each team, where Player 1 tackles the code for 120 seconds. Meanwhile, the remaining team members are blindfolded, ensuring they cannot observe Player 1's actions. When the time limit is reached, a buzzer signals the switch, with Player 2 taking the rein, followed by subsequent rotations for the remaining four team members. This unique challenge adds an element of suspense and coordination to the coding experience.",
    rules: [
      "This will be held on Compiler.",
      "Overall time limit for this round will be 30 minutes for each team.",
      "Only two teams amongst all the teams will appear for round 4 and others will be eliminated",
      "Each team will get 5 minutes to set their action plan.",
      "There will be 1 coordinator assigned to each team.",
      "After every 120 seconds the assigned coordinator for the team will turn the monitor and timer off and will only be resumed after the player switch places."
    ]
  },
  {
    title: "ROUND 4: Programming Showdown",
    description: "The top 8 finalists will engage in a fierce battle, participants will face challenging coding questions, and the top 3 players who solve them accurately and quickly will be determined the three ultimate winners.",
    rules: [
      "This will be held on Hacker rank.",
      "Overall time limit for this round will be 15 minutes."
    ]
  }
];

export default Rules;