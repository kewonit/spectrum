// not-found.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

interface CatPosition {
  y: number;
}

const NotFound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [catPos, setCatPos] = useState<CatPosition>({ y: 0 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<boolean>(false);
  const gravityRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);

  // Constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const GROUND_Y = 0;
  const OBSTACLE_SPEED = 5;

  const startGame = (): void => {
    setIsPlaying(true);
    setScore(0);
    setIsGameOver(false);
    setCatPos({ y: 0 });
    setObstacles([{ x: 600, width: 20, height: 40 }]);
  };

  const jump = (): void => {
    if (catPos.y === GROUND_Y) {
      jumpRef.current = true;
      gravityRef.current = JUMP_FORCE;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isPlaying) {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = (): void => {
      // Update cat position
      setCatPos(prev => {
        const newY = Math.max(GROUND_Y, prev.y + gravityRef.current);
        gravityRef.current += GRAVITY;
        return { y: newY };
      });

      // Update obstacles
      setObstacles(prev => {
        let newObstacles = prev
          .map(obs => ({
            ...obs,
            x: obs.x - OBSTACLE_SPEED
          }))
          .filter(obs => obs.x > -obs.width);

        if (newObstacles.length === 0) {
          newObstacles.push({
            x: 600,
            width: 20,
            height: 40
          });
        }

        return newObstacles;
      });

      // Collision detection
      const catRect = {
        x: 50,
        y: catPos.y,
        width: 30,
        height: 30
      };

      obstacles.forEach(obstacle => {
        const obsRect = {
          x: obstacle.x,
          y: GROUND_Y,
          width: obstacle.width,
          height: obstacle.height
        };

        if (
          catRect.x < obsRect.x + obsRect.width &&
          catRect.x + catRect.width > obsRect.x &&
          catRect.y < obsRect.y + obsRect.height &&
          catRect.y + catRect.height > obsRect.y
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          return;
        }
      });

      // Update score
      setScore(prev => prev + 1);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      {/* CRT screen effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black opacity-20" />
      
      <div className="relative w-full max-w-2xl px-8">
        {/* Retro-styled title */}
        <h1 className="text-8xl mb-4 font-mono text-center animate-pulse text-red-500 tracking-widest">404</h1>
        <h2 className="text-2xl mb-8 font-mono text-center tracking-wider text-yellow-400">PAGE NOT FOUND, BUT HERE'S ONEKO</h2>
        
        {/* Game area with retro border */}
        <div className="relative w-full h-64 border-4 border-blue-500 bg-black mb-8 overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-repeat-y pointer-events-none opacity-5" 
               style={{
                 backgroundImage: 'linear-gradient(transparent 50%, rgba(255,255,255,0.8) 50%)',
                 backgroundSize: '100% 4px'
               }} />
          
          {/* Player character */}
          <div className="absolute left-12 bottom-0 w-8 h-8 bg-yellow-400"
               style={{
                 transform: `translateY(${-catPos.y}px)`,
                 boxShadow: '0 0 10px rgba(255,255,0,0.5)'
               }}>
            <div className="w-full h-full animate-pulse" />
          </div>
          
          {/* Obstacles with retro styling */}
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              className="absolute bottom-0 bg-red-500"
              style={{
                left: `${obstacle.x}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
                boxShadow: '0 0 8px rgba(255,0,0,0.6)'
              }}
            />
          ))}
        </div>

        {/* Score display with retro styling */}
        <div className="absolute top-4 right-4 font-mono text-xl bg-blue-500 px-4 py-2 rounded">
          SCORE: {score}
        </div>
        
        {/* High score */}
        <div className="absolute top-4 left-4 font-mono text-xl bg-purple-500 px-4 py-2 rounded">
          HIGH SCORE: {highScore}
        </div>

        {/* Game controls */}
        {!isPlaying && (
          <div className="text-center font-mono">
            <p className="mb-4 text-2xl text-yellow-400">
              {isGameOver ? "GAME OVER!" : "INSERT COIN"}
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-mono text-xl tracking-wide animate-pulse"
            >
              {isGameOver ? "CONTINUE?" : "START"}
            </button>
            <p className="mt-4 text-blue-400">PRESS SPACE TO JUMP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;