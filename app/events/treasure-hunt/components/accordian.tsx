import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Rules() {
  return (
    <div className="w-full text-white">
      <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Rules of Treasure Hunt
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Total 3 rounds
      </p>

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
  );
}

const rounds = [
  {
    title: "ROUND 1: Aptitude Test",
    description:
      "A quick 15-minute assessment of your logical reasoning and English language skills. No coding knowledge required for any rounds of this competition.",
    rules: [
      "Each team will be given an MCQ - based question paper of 20 min",
      "The paper will a combination of all easy, medium and hard level questions",
      "Top teams with the highest score proceed to the next round.",
    ],
  },
  {
    title: "ROUND 2: Mystery Mania",
    description:
      "Step into the world of mystery in Mystery Mania, where puzzling photos await! Use your observation skills and deductive reasoning to uncover hidden clues and solve visual mysteries.",
    rules: [
      "All the teams will be divided into 4 colours.",
      "QR code clues will be scattered across the maps each team needs to collect all the clues leading to the final point.",
      "Fastest teams from each colour proceed to the next round.",
    ],
  },
  {
    title: "ROUND 3: The Final Hunt",
    description:
      "Whispers of fortune guide your path in this ultimate challenge. Navigate through a series of puzzles and physical challenges, including an exciting laser maze obstacle course, to claim the final prize.",
    rules: [
      "Every person will have to hunt for treasure",
      "4 set of different puzzles/rounds will be there",
      "Every participant from each team will choose their set according to their abilities.",
      "At the end there are 3 treasure chest, the team that opens any one of the 3 chests are the winners",
      "The first 3 teams to open the three boxes accordingly win.",
    ],
  },
];


export default Rules;
