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
        Rules of Shark Tank
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
        Total 2 rounds
      </p>

      <Accordion type="single" collapsible className="space-y-4">
        {rounds.map((round, index) => (
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
                  {round.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-4">
              <div className="space-y-6">
                <p className="text-white/80 leading-relaxed text-lg">
                  {round.description}
                </p>
                <div className="bg-white/15 rounded-xl p-6 space-y-4">
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
    title: "ROUND 1: Idea Submission",
    description: "Submit your innovative business idea that could potentially revolutionize the market. Your submission should include a comprehensive overview of your business concept, target audience, problem statement, and proposed solution in P.D.F. format.",
    rules: [
      "Submit a 300-word description essay of your business idea",
      "Include technical and financial details in your submission",
      "Clearly outline the problem your idea solves",
      "Describe your target audience and market size",
      "Explain your competitive advantage",
      "Round 1 requires a 300-word description in PDF of the business idea",
      "Only the foremost ideas will be selected for the next round"
    ]
  },
  {
    title: "ROUND 2: Meet The Sharks",
    description: "This will be the finale, where selected teams pitch to our panel of industry experts and entrepreneurs. This is where you'll have the opportunity to secure recognition, valuable feedback, and exciting prizes.",
    rules: [
      "Presentation duration: 5-7 minutes",
      "PowerPoint or similar visual presentation is mandatory",
      "Cover all key aspects: problem, solution, market size, revenue model",
      "Include competitive analysis and future vision",
      "Teams must arrive 30 minutes before their scheduled pitch time",
      "Bring any prototypes or demos if available",
      "Be prepared for potential questions from The Sharks",
      "Judging criteria: Innovation (20), Feasibility (20), Presentation (20), Business Model (20), Social Impact (10), Q&A (10)",
      "Top 3 teams will receive cash prizes and certificates"
    ]
  }
];