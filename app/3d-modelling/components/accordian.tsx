import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Rules() {
  return (
    <Accordion type="single" collapsible className="w-full text-gray-700 p-4 lg:p-8">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl">Competition Guidelines:</h1>
      <p className="leading-7 mb-4">
          Tower Building Challenge
      </p>
      <AccordionItem value="item-1">
        <AccordionTrigger>Materials Provided</AccordionTrigger>
        <AccordionContent>
          - Popsicle sticks<br/>
          - Adhesive fevicol<br/>
          - Basic tools (cutters and clips allowed)
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Technical Specifications</AccordionTrigger>
        <AccordionContent>
          - Height must be exactly 30cm<br/>
          - Consistent cross-section throughout<br/>
          - Flat, stable bottom surface<br/>
          - Flat top surface for load placement<br/>
          - Maximum load-to-weight ratio required
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Testing and Evaluation</AccordionTrigger>
        <AccordionContent>
          - Load testing under judge supervision<br/>
          - Structural integrity assessment<br/>
          - Measurement verification<br/>
          - Final evaluation by civil engineering faculty
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}