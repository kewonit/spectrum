import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Rules() {
  return (
    <div className="w-full text-white">
      {/* <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Rules of E-Paradox
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Total 4 rounds
      </p> */}

      <Accordion type="single" collapsible className="space-y-4">
        {rounds.map((round, index) => (
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
                  {round.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-4">
              <div className="space-y-6">
                <p className="text-white/80 leading-relaxed text-lg">
                  {round.description}
                </p>
                <div className="bg-white/15 backdrop-blur-lg rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Rules:</h4>
                  <ul className="space-y-3">
                    {round.rules.map((rule, idx) => (
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