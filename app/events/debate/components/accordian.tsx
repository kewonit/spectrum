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
        Rules of Debate Competition
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        A two-round competition for first-year students
      </p>

      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 md:space-y-6">
        {sections.map((section, index) => (
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
                  {section.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 md:px-6 pb-4 md:pb-6 pt-3 md:pt-4">
              <div className="space-y-4 md:space-y-6">
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">
                  {section.description}
                </p>
                <div className="bg-[#EBE9E0] rounded-xl md:rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
                  <h4 className="font-semibold text-gray-900 text-base md:text-lg">Guidelines:</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {section.rules.map((rule, idx) => (
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

const sections = [
  {
    title: "Eligibility & Team Formation",
    description: "Requirements for participation in the debate competition:",
    rules: [
      "Competition is exclusively open to First-year students",
      "Teams must consist of exactly two members",
      "All team members must register together before the event"
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