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
        Total 5 rounds
      </p>

      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 md:space-y-6">
        {rounds.map((round, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index + 1}`} 
            className="border-none rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 mx-1 sm:mx-2 md:mx-0"
          >
            <AccordionTrigger className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline data-[state=open]:bg-[#EBE9E0] rounded-lg sm:rounded-xl md:rounded-2xl group transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full bg-[#EBE9E0] group-data-[state=open]:bg-white text-gray-800 font-bold text-sm sm:text-base md:text-lg transition-all duration-300">
                  {index + 1}
                </span>
                <h3 className="text-sm sm:text-base md:text-xl font-semibold group-hover:text-gray-900 text-left">
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
      "Overall time limit for this round will be 10 minutes for each candidate",
      "35% amongst all the candidates will be eliminated while others will appear for round 2"
    ]
  },
  {
    title: "ROUND 2: Odd Function Out",
    description: '"Odd Function Out!" Participants will receive a Hackerrank contest link the day before the event. Inside, there are four coding questions. Your task is to choose and solve any three questions that align with your coding strengths.',
    rules: [
      "This will be held on Hacker rank Platform.",
      "Overall time limit for this round will be 30 minutes for each candidate.",
      "4 problem statements will be provided. Participants will have to solve any three amongst those four statements.",
      "50% amongst all the candidates will be eliminated while others will appear for round 3"
    ]
  },
  {
    title: "ROUND 3: Tech Sprint (Team)",
    description: "In this round, coordinators will form groups, and each group will embark on a coding journey. Using your preferred programming language, solve a series of coding problems. Here's the twist: unlock folders on your PC by generating passwords based on the output of previous problems. Inside each folder lies a clue leading to the next challenge.",
    rules: [
      "This will be held on an online compiler(online GDB).",
      "Overall time limit for this round will be 60 minutes for each team.",
      "Each team will get 10 minutes to set their action plan and order for relay.",
      "During this round participants should take utmost care of not disturbing the college environment and causing any chaos in the campus.",
      "Participant will be solely responsible for any damage/ harm caused due his/her recklessness.",
      "There will be 1 coordinator assigned to each team."
    ]
  },
  {
    title: "ROUND 4: Into the Unknown (Team)",
    description: "A single problem statement will be presented to each team, where Player 1 tackles the code for 90 seconds. Meanwhile, the remaining team members are blindfolded, ensuring they cannot observe Player 1's actions. When the time limit is reached, a buzzer signals the switch, with Player 2 taking the rein, followed by subsequent rotations for the remaining four team members. This unique challenge adds an element of suspense and coordination to the coding experience.",
    rules: [
      "This will be held on Compiler.",
      "Overall time limit for this round will be 30 minutes for each team.",
      "Two teams amongst all the teams will be eliminated while others will appear for round 5",
      "Each team will get 5 minutes to set their action plan.",
      "There will be 1 coordinator assigned to each team.",
      "After every 90 seconds the assigned coordinator for the team will turn the monitor and timer off and will only be resumed after the player switch places."
    ]
  },
  {
    title: "ROUND 5: Programming Showdown",
    description: "The top 8 finalists will engage in 1v1 battles, participants will face challenging coding questions, and the player who solves them accurately and quickly will advance to the semifinals. Tackling level 2 questions to determine the three ultimate winners.",
    rules: [
      "This will be held on Hacker rank.",
      "Overall time limit for this round will be 15 minutes for each 1v1."
    ]
  }
];
