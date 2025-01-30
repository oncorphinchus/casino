'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type BetType = 'red' | 'black' | 'green' | number;

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);

  const numbers = Array.from({ length: 37 }, (_, i) => i);
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const getNumberColor = (num: number) => {
    if (num === 0) return 'green';
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const spin = () => {
    if (!selectedBet) return;
    
    setSpinning(true);
    const randomNumber = Math.floor(Math.random() * 37);
    
    setTimeout(() => {
      setResult(randomNumber);
      setSpinning(false);
    }, 3000);
  };

  const placeBet = (bet: BetType) => {
    setSelectedBet(bet);
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Roulette</h1>

        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => placeBet('red')}
              className={`bg-red-600 p-4 rounded-lg ${selectedBet === 'red' ? 'ring-2 ring-white' : ''}`}
            >
              Red
            </button>
            <button
              onClick={() => placeBet('black')}
              className={`bg-zinc-900 p-4 rounded-lg ${selectedBet === 'black' ? 'ring-2 ring-white' : ''}`}
            >
              Black
            </button>
            <button
              onClick={() => placeBet('green')}
              className={`bg-green-600 p-4 rounded-lg ${selectedBet === 'green' ? 'ring-2 ring-white' : ''}`}
            >
              Green (0)
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-8">
            {numbers.map((num) => (
              <button
                key={num}
                onClick={() => placeBet(num)}
                className={`p-4 rounded-lg ${
                  getNumberColor(num) === 'red' ? 'bg-red-600' : 
                  getNumberColor(num) === 'black' ? 'bg-zinc-900' : 'bg-green-600'
                } ${selectedBet === num ? 'ring-2 ring-white' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={spin}
            disabled={spinning || !selectedBet}
            className="bg-zinc-800 px-6 py-2 rounded-full disabled:opacity-50 w-full"
          >
            {spinning ? 'Spinning...' : 'Spin'}
          </button>

          {result !== null && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <h2 className="text-2xl mb-4">Result: {result}</h2>
              <div className={`inline-block px-4 py-2 rounded-lg ${
                getNumberColor(result) === 'red' ? 'bg-red-600' : 
                getNumberColor(result) === 'black' ? 'bg-zinc-900' : 'bg-green-600'
              }`}>
                {getNumberColor(result).toUpperCase()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 