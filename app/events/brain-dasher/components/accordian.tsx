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
        Rules of Braindasher
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Total 3 rounds, rest to be updated soon!
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
    title: "ROUND 1: Quiz",
    description:
      "The initial qualifying round conducted by faculties. From a pool of 150 participants, 32 participants will be selected for Round 2. Before the actual rounds begin, DEMO VIDEOS of all games will be shown to the participants.",
    rules: [
      "Faculty members will conduct the quiz",
      "Top 30-32 participants will qualify for the next round",
      "Demo videos will be shown before the competition begins",
    ],
  },
  // more rounds to be updated soon.
];
