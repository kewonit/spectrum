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
        Rules of Shark Tank
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Total 2 rounds
      </p>

      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 md:space-y-6">
        {rounds.map((round, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index + 1}`} 
            className="border-none rounded-lg sm:rounded-xl md:rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 mx-1 sm:mx-2 md:mx-0"
          >
            <AccordionTrigger className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline data-[state=open]:bg-[#EBE9E0] rounded-lg sm:rounded-xl md:rounded-2xl group transition-all duration-300">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 rounded-full bg-[#EBE9E0] group-data-[state=open]:bg-white text-gray-800 font-bold text-sm sm:text-base md:text-lg transition-all duration-300">
                  {index + 1}
                </span>
                <h3 className="text-sm sm:text-base md:text-xl font-semibold group-hover:text-gray-900 text-left">
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
    title: "ROUND 1: Idea and Video Clip Submission",
    description: "Submit your innovative business idea that could potentially revolutionize the market. Your submission should include a comprehensive overview of your business concept, target audience, problem statement, and proposed solution in P.D.F. format. You should also submit a 2-minute video clip giving a brief description about your business idea.",
    rules: [
      "Submit a 300-word description and a 2-minute video clip of your business idea",
      "Include technical and financial details in your submission",
      "Clearly outline the problem your idea solves",
      "Describe your target audience and market size",
      "Explain your competitive advantage",
      "The video clip should not be more than 2-minutes long. It should describe the business concept and the profitability of the business in brief",
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