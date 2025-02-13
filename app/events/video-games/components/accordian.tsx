import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  
  export function Rules() {
    return (
      <Accordion type="single" collapsible className="space-y-4">
        <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Rules of Electrica : </h1>
        <p className="leading-7 mb-8 text-white/80 text-sm sm:text-base">
            Total 4 rounds
        </p>
        
        <AccordionItem value="item-1" className="border-none rounded-xl bg-white/10 transition-all duration-300"        >
          <AccordionTrigger>ROUND 1: Resistance is Futile</AccordionTrigger>
          <AccordionContent>
          1. Aptitude Test <br/>
          2. 20mins to solve 30 questions <br/>
          3. Group based(2 people to 5 people group) <br/>
          4. Difficulty: EASY to MEDIUM <br/>
          5. Based on the fundamentals of electronics and electrical(and also some basic logical questions like word search etc, and puzzles) <br/>
          6. 30% of the teams to be eliminated. <br/>
          <hr className="border-2 pb-2"/>
          Rules for Round 1:<br/>
          The use of a scientific calculator is allowed.<br/>
          Use of Mobile Phones not allowed.<br/>
          <hr className="border-2 pb-2"/>
          Method for aptitude test:<br/>
          Paper Based
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>ROUND 2: Buzzer Battle</AccordionTrigger>
          <AccordionContent>
          1. This game is a buzzer game in which teams have to answer questions quickly and accurately in a given frame of time. <br/>
          2. Questions will be based on basic knowledge of electronics engineering. <br/>
          3. The number of questions would be a surprise. <br/>
          4. 5 Teams would be allowed to play this game at once, out of which 1 of them would be selected. <br/>
          5. Difficulty: Medium to hard. <br/>
          6. 50% will be eliminated 
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>ROUND 3: Simulated Era</AccordionTrigger>
          <AccordionContent>
          1. Includes building a circuit on multi-sim.<br/>
          2. The allotment of the type of trainer kit would be based on lottery.<br/>
          3. 30min <br/>
          <hr className="border-2 pb-2"/>
          Rules for ROUND 3:<br/>
          1. Three clues are allowed which can involve options like helping in a particular step, call a friend for 1 minute, using of google chrome is allowed for 1minute.<br/>
          2. No use of the internet allowed except while using clues
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>ROUND 4: Circuit Safari</AccordionTrigger>
          <AccordionContent>
          1. This round consists of a Human Maze, where the humans will act as pawns.<br/>
          2. This will give an ultimate experience of playing real-life snakes and ladders with a twist of electronics.<br/>
          3. Each team has to send one member to play in the maze who will collect electronic components by completing the safari circuit. Team can change their playing member during half-time.<br/>
          4. After completing the maze , each team has to build a physical circuit using the components collected from the maze within a time limit
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
    