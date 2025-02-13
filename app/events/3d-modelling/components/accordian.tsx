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
        Model Making Competition Rules
      </h1>
      <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
      Are you ready to design, build, and impress—all in the moment? Let’s see who can turn a spark of inspiration into a masterpiece.
      Maximum registration for the event is 50.
      </p>

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
    title: "Project Overview",
    description: "Basic requirements for the tower construction challenge:",
    rules: [
      "Create a tower model using popsicle sticks for elevated water tank support",
      "Work in groups of maximum 3 students",
      "Tower must maintain a consistent cross-section throughout its height",
      "Total height of the tower must be exactly 30 cm",
      "Project will be evaluated under judge supervision"
    ]
  },
  {
    title: "Materials & Tools",
    description: "Approved materials and tools for construction:",
    rules: [
      "Popsicle sticks (provided)",
      "Fevicol adhesive (provided)",
      "Cutters (allowed)",
      "Clips (allowed)",
      "Use of any other materials will result in disqualification"
    ]
  },
  {
    title: "Design Requirements",
    description: "Structural specifications for the tower:",
    rules: [
      "Bottom must be even for stable placement on flat surface",
      "Top must be flat to create horizontal platform for load placement",
      "Cross-section must remain constant throughout the entire height",
      "Structure should maximize load carrying capacity to self-weight ratio",
      "Height requirement of 30 cm is mandatory"
    ]
  },
  {
    title: "Evaluation Criteria",
    description: "Judging parameters and competition rules:",
    rules: [
      "Load carrying capacity relative to self-weight",
      "Structural stability and build quality",
      "Adherence to height and design specifications",
      "Proper use of approved materials only",
      "Load testing will be conducted under judge supervision"
    ]
  },
  {
    title: "Competition Rules",
    description: "General guidelines and regulations:",
    rules: [
      "Judge's decision will be final and binding",
      "No arguments or disputes will be entertained",
      "Disqualification for use of unauthorized materials",
      "Teams must follow all safety guidelines during construction",
      "Civil Department faculty will assist with supervision"
    ]
  }
];