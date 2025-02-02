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
        Model Making Competition Rules
      </h1>
      <p className="leading-7 mb-6 sm:mb-8 px-2 sm:px-4 md:px-0 text-sm sm:text-base">
        Tower Construction Challenge using Popsicle Sticks
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