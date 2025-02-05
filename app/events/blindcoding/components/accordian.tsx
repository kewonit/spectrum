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
        Rules of Blind Coding Competition
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Test your programming skills without visual feedback
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
    title: "Overview",
    description: "Basic requirements and eligibility:",
    rules: [
      "Competition is open to first-year students only",
      "Event will be divided into 2 levels: Quiz Round and Blind Coding",
      "Programming languages allowed: C, C++, Java, and Python",
      "Teams must have 2-3 members",
      "Scientific calculators allowed for first round"
    ]
  },
  {
    title: "General Rules",
    description: "Competition guidelines and restrictions:",
    rules: [
      "Participants must bring their own stationery (calculators, pens, etc)",
      "No personal computers or electronic components allowed",
      "Use of AI chatbots like ChatGPT is strictly prohibited",
      "No mobile phones, smartwatches, or other electronic devices",
      "Participants will be strictly monitored with volunteer assistance available"
    ]
  },
  {
    title: "Level 1: Quiz Round",
    description: "First stage of the competition:",
    rules: [
      "Duration: 30 minutes",
      "Format: Multiple Choice Questions (MCQs)",
      "Topics: Basic Programming Concepts and Data Structures",
      "Scoring: +1 for correct answers, 0 for incorrect",
      "Top performers qualify for Level 2"
    ]
  },
  {
    title: "Level 2: Blind Coding",
    description: "Final stage with evaluation criteria:",
    rules: [
      "Duration: 60 minutes",
      "1-3 coding problems to solve",
      "Monitor will be turned off during coding",
      "Basic text editor provided",
      "No internet access or external resources allowed"
    ]
  },
  {
    title: "Evaluation & Results",
    description: "Judging criteria and decision process:",
    rules: [
      "Correctness (50%), Code Quality (20%)",
      "Efficiency (20%), Logical Approach (10%)",
      "Tie-breakers: Speed of submission, code quality, quiz performance",
      "Event coordinators' decision is final and binding",
      "Winners announced at end with prizes for top performers"
    ]
  }
];