import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Rules() {
  return (
    <div className="w-full text-white">
      <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
      Rules of Chem Prastuti
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Theme: Ancient Indian Chemistry & Conservation
      </p>

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
    title: "Research Themes",
    description: "Choose one of the following themes for your presentation:",
    rules: [
      "Green Chemistry for a Better Future",
    ]
  },
  {
    title: "Team Formation & Eligibility",
    description: "Guidelines for participating teams:",
    rules: [
      "Maximum of 2 participants from FY B.Tech per team",
      "Teams must register in advance - no spot entries allowed",
      "All team members must be from the same academic year"
    ]
  },
  {
    title: "Presentation Guidelines",
    description: "Rules and format for paper presentation:",
    rules: [
      "Presentation duration: 8 minutes + 2 minutes for judges' questions",
      "Presentations must be in MS-PowerPoint (PPT) format only",
      "Both hard and soft copies must be submitted to engg.chem2010@gmail.com before the presentation",
      "Plagiarism limit: Maximum 20% similarity allowed",
      "Direct copying from internet sources will lead to disqualification"
    ]
  },
  {
    title: "Judging & Awards",
    description: "Evaluation criteria and prizes:",
    rules: [
      "Judging will be based on predefined presentation rubrics",
      "Three winners will be selected (First, Second & Third positions)",
      "Judges' and event heads' decisions will be final and binding",
      "The organizers reserve the right to modify rules with due notice to participants"
    ]
  }
];