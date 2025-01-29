import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function Rules() {
    return (
      <Accordion type="single" collapsible className="w-full text-gray-700 lg:p-8">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl">Rules of Blind Coding: </h1>
        <p className="leading-7 mb-4">
        This event is going to be team-based. <br/>
        A team should have a minimum of 2 and maximum of 5 members <br/>
        Entry fee: Rs 100/- per person <br/>
        Total 4 rounds <br/>
        <hr className="pt-4"/>  
        </p>
        <AccordionItem value="item-1">
          <AccordionTrigger>ROUND 1: RESISTANCE IS FUTILE</AccordionTrigger>
          <AccordionContent>
          1.	This round is going to be an Aptitude Test. <br/>
          2.	You&apos;ve got a half-hour to tackle 30 multiple-choice questions. <br/>
          3.	1 mark for correct question. There will not be any negative marking. <br/>
          4.	Questions will be based on basic concepts of electronics and few logic-based questions. <br/>
          5.	The use of a scientific calculator is allowed. <br/>
          6.	Use of smart phones, laptops, smart watches, etc. is strictly prohibited. <br/>
          7.	The examination will be conducted using pen and paper. <br/>
          8.	Judging Criteria: <br/>
          Teams would be selected on the basis of number of questions answered correctly.  <br/>v
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>ROUND 2: FAST AND FURIOUS</AccordionTrigger>
          <AccordionContent>
          1.	In this round, teams will engage in a Buzzer Battle, aiming to respond swiftly and accurately to the questions. <br/>
          2.	Teams earn points for quickly answering correctly by hitting the button first, but incorrect responses result in point deductions. <br/>
          3.	Number of questions will be a surprise. <br/>
          4.	Team with the most points in a group will advance into the next round. <br/>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>ROUND 3: CIRCUIT SAFARI</AccordionTrigger>
          <AccordionContent>
          1.	This will be the Final Showdown of the event. <br/>
          2.	Each team has to send one member to play in a game of real-life snakes and ladders with a twist of electronics. <br/>
          3.	Players would act as pawns who must collect electronic components from the board. <br/>
          4.	Teams can change their playing member during half-time. <br/>
          5.	Each team will have to start building a physical circuit using the components collected from the board. <br/>
          6.	The First three teams who successfully build a working circuit as per the requirements wins the game! <br/>
          7.	This round comes with some unexpected surprises too! <br/>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
    