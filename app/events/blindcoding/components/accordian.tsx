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
        Rules of Blind Coding Competition
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Test your programming skills without visual feedback
      </p> */}

      <Accordion type="single" collapsible className="space-y-4">
        {sections.map((section, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index + 1}`} 
            className="border-none rounded-xl bg-white/10 transition-all duration-300"
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
                <div className="bg-white/15 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Guidelines:</h4>
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
    title: "Overview",
    description: "Basic requirements and eligibility:",
    rules: [
      "Competition is open to first-year students only",
      "Event will be divided into 2 levels: Quiz Round and Blind Coding",
      "Programming languages allowed: C, C++, Java, and Python",
      "Participation is solo.",
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
      "Mode: Online",
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