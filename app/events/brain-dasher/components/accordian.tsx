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
        Rules of Braindasher
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
    title: "ROUND 1: Quiz",
    description: "The initial qualifying round conducted by faculties. From a pool of 150-200 participants, 30-32 participants will be selected for Round 2. Before the actual rounds begin, DEMO VIDEOS of all games will be shown to the participants.",
    rules: [
      "Faculty members will conduct the quiz",
      "Top 30-32 participants will qualify for the next round",
      "Demo videos will be shown before the competition begins"
    ]
  },
  {
    title: "ROUND 2: Memory Games",
    description: "This round consists of two parts: 'Flip in Order' and 'Arrange in Order'. In Part 1, teams compete to flip numbered cards in sequence. In Part 2, teams memorize and recreate card sequences. Winners from both parts advance to the final round.",
    rules: [
      "Part 1 - Flip in Order:",
      "Teams of 2 participants each",
      "30 cards numbered 1-30 will be arranged face down",
      "Teams must flip cards in numerical order",
      "10-minute time limit per game",
      "Maximum 5 seconds allowed per card flip",
      "8 teams will be selected for Part 2",
      "Part 2 - Arrange in Order:",
      "Teams memorize 10-card sequence in 45 seconds",
      "90 seconds to recreate the sequence",
      "Both number and suit must match perfectly",
      "4 teams advance to the final round"
    ]
  },
  {
    title: "ROUND 3: Word Game (Buzzer Round)",
    description: "The final round is an individual competition featuring diagrammatic representations of words/phrases, riddles, word unscrambling, and hangman. All 8 qualified participants compete using buzzers to answer questions displayed on a projector.",
    rules: [
      "Individual competition with buzzer system",
      "Questions include pictorial representations, riddles, scrambled words, and hangman",
      "First to buzz with correct answer earns one point",
      "Top three scorers will be declared winners",
      "Questions will be displayed via projector"
    ]
  }
];