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
        Rules of Debate Competition
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        A two-round competition for first-year students
      </p> */}

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
                  <h4 className="font-semibold text-lg">Rules:</h4>
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
    title: "Eligibility & Team Formation",
    description: "Requirements for participation in the debate competition:",
    rules: [
      "Competition is exclusively open to First-year students",
      "Teams must consist of exactly two members",
      "All team members must register together before the event",
      "Must pick one language. Marathi, Hindi, English, but cannot be changed after the selection.",
    ]
  },
  {
    title: "Code of Conduct",
    description: "Expected behavior and professional standards for all participants:",
    rules: [
      "Participants must maintain respect, fairness, and professionalism throughout the competition",
      "Offensive language or personal attacks will result in immediate disqualification",
      "Teams must show courtesy to opponents, judges, and organizers",
      "Professional demeanor must be maintained during rebuttals and responses"
    ]
  },
  {
    title: "Preliminary Round Format",
    description: "Structure and rules for the initial round of debate:",
    rules: [
      "Topics will be provided on the spot",
      "8 minutes preparation time will be given to teams",
      "Each team gets 6 minutes for primary argument presentation",
      "2 minutes allocated for rebuttal after opponent's presentation",
      "Judges will evaluate based on content, delivery, and topic relevance"
    ]
  },
  {
    title: "Final Round Format",
    description: "Structure and rules for the championship round:",
    rules: [
      "Topics will be pre-announced before the final round",
      "Each team gets 8 minutes for primary argument presentation",
      "2 minutes allocated for rebuttal after opponent's presentation",
      "Enhanced scoring criteria compared to preliminary round"
    ]
  },
  {
    title: "Judging Criteria",
    description: "Evaluation metrics used by judges to score performances:",
    rules: [
      "Content (40%): Depth of research, originality, and clarity of arguments",
      "Delivery (30%): Confidence, articulation, and body language",
      "Relevance (20%): Adherence to topic and theme alignment",
      "Teamwork/Engagement (10%): Team coordination and rebuttal interaction"
    ]
  }
];