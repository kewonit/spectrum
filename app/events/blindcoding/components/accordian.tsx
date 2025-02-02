import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Rules() {
  return (
    <Accordion type="single" collapsible className="w-full text-gray-700 lg:p-8">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Rules of Blind Coding Competition
      </h1>
      
      <div className="mb-8 space-y-4">
        <p className="leading-7">This competition is designed to test your programming skills without visual feedback.</p>
        <div className="space-y-2">
          <p className="leading-7">• Competition is open to first-year students only</p>
          <p className="leading-7">• Event will be divided into 2 levels: Quiz Round and Blind Coding</p>
          <p className="leading-7">• Programming languages allowed: C, C++, Java, and Python</p>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <h2 className="text-2xl font-bold mb-4">General Rules:</h2>
        <div className="space-y-2">
          <p className="leading-7">• Event will be team-based (Each team can have a minimum of 2 members and maximum of 3)</p>
          <p className="leading-7">• Scientific Calculators are allowed for the first round of the event</p>
          <p className="leading-7">• Participants will have to carry their own stationary (Calculators, pens, etc)</p>
          <p className="leading-7">• Personal computers, electronic components are not allowed for use during the event</p>
          <p className="leading-7">• The use of A.I. chatbots like ChatGPT is strictly prohibited</p>
          <p className="leading-7">• Participants are not allowed to use mobile phones, smartwatches, or any other electronic devices</p>
          <p className="leading-7">• Participants will be strictly monitored, and volunteers will be available to provide assistance if necessary</p>
          <p className="leading-7">• Each round will have a specified time limit that participants must adhere to</p>
          <p className="leading-7">• The final decision will be based on computerized results and made by the event coordinators</p>
          <p className="leading-7">• The decision of the event coordinators is final and binding, not subject to contestation</p>
          <p className="leading-7">• The organizers reserve the right to change or update the contest rules, and participants are responsible for staying informed</p>
          <p className="leading-7">• Violation of any rule may result in immediate disqualification</p>
          <p className="leading-7">• All the participants must return the electronic components provided to them after the event</p>
          <p className="leading-7">• The team would be held responsible for any damage caused to electronic components due to mishandling or carelessness, and would be required to pay a fine</p>
          <p className="leading-7">• Spot entries will be accepted until the team registration limit is reached</p>
        </div>
      </div>

      <AccordionItem value="item-1">
        <AccordionTrigger>Level 1: Quiz Round</AccordionTrigger>
        <AccordionContent className="space-y-2">
          <p className="leading-7">• Duration: 30 minutes</p>
          <p className="leading-7">• Format: Multiple Choice Questions (MCQs)</p>
          <p className="leading-7">• Topics: Basic Programming Concepts and Data Structures</p>
          <p className="leading-7">• Scoring: +1 for correct answers, 0 for incorrect</p>
          <p className="leading-7">• Top performers qualify for Level 2</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Level 2: Blind Coding Challenge</AccordionTrigger>
        <AccordionContent className="space-y-2">
          <p className="leading-7">• Duration: 60 minutes</p>
          <p className="leading-7">• 1-3 coding problems to solve</p>
          <p className="leading-7">• Monitor will be turned off during coding</p>
          <p className="leading-7">• Basic text editor provided</p>
          <p className="leading-7">• No internet access or external resources allowed</p>
          <h3 className="font-semibold mt-4 mb-2">Evaluation Criteria:</h3>
          <p className="leading-7">• Correctness (50%)</p>
          <p className="leading-7">• Code Quality (20%)</p>
          <p className="leading-7">• Efficiency (20%)</p>
          <p className="leading-7">• Logical Approach (10%)</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Tie-Breaking and Results</AccordionTrigger>
        <AccordionContent className="space-y-2">
          <p className="leading-7">Tie-breakers will be determined by:</p>
          <p className="leading-7">1. Speed of submission</p>
          <p className="leading-7">2. Code quality</p>
          <p className="leading-7">3. Quiz performance</p>
          <p className="leading-7">Winners will be announced at the end of the competition with prizes for top performers.</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default Rules;