'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/app/context/CurrencyContext';
import GameNav from '@/app/components/GameNav';
import { useUser } from '@/app/context/UserContext';
import LoginForm from '@/app/components/LoginForm';
import RouletteBoard from '@/app/components/RouletteBoard';
import { BetType, PlacedBet } from '@/app/types/roulette';

export default function Roulette() {
  const { user } = useUser();
  const { balance, updateBalance } = useCurrency();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [currentBet, setCurrentBet] = useState(0);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  
  const numbers = Array.from({ length: 37 }, (_, i) => i);
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  const getNumberColor = (num: number) => {
    if (num === 0) return 'green';
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const placeBet = (bet: BetType) => {
    if (!spinning) {
      setSelectedBet(bet);
    }
  };

  const setBetAmount = (amount: number) => {
    if (amount <= balance && !spinning) {
      setCurrentBet(amount);
      setSelectedChip(amount);
    }
  };

  const calculateWinnings = (result: number, bet: BetType, amount: number) => {
    if (typeof bet === 'number') {
      // Single number bet pays 35 to 1
      return bet === result ? amount * 36 : 0;
    } else {
      // Color bets pay 1 to 1
      const resultColor = getNumberColor(result);
      return bet.type === resultColor ? amount * 2 : 0;
    }
  };

  const spin = () => {
    if (!selectedBet || currentBet === 0) return;
    
    setSpinning(true);
    const randomNumber = Math.floor(Math.random() * 37);
    
    setTimeout(() => {
      setResult(randomNumber);
      setSpinning(false);
      
      // Calculate and award winnings for all placed bets
      let totalWinnings = 0;
      placedBets.forEach(bet => {
        const winnings = calculateWinnings(randomNumber, bet.betType, bet.amount);
        totalWinnings += winnings;
      });
      
      if (totalWinnings > 0) {
        updateBalance(totalWinnings);
      }
      
      // Reset bets
      setCurrentBet(0);
      setSelectedBet(null);
      setPlacedBets([]);
    }, 3000);
  };

  const startNewGame = () => {
    setResult(null);
    setSelectedBet(null);
  };

  const handleBetPlacement = (betType: BetType) => {
    if (!spinning && selectedChip && selectedChip <= balance) {
      setPlacedBets([...placedBets, { betType, amount: selectedChip }]);
      setSelectedBet(betType);
      updateBalance(-selectedChip);
    }
  };

  const getChipColor = (value: number): string => {
    const chipColors = {
      1: 'bg-white',
      5: 'bg-red-500',
      25: 'bg-green-500',
      100: 'bg-black',
      500: 'bg-purple-500',
      1000: 'bg-yellow-500'
    };
    return chipColors[value as keyof typeof chipColors];
  };

  if (!user) {
    return (
      <main className="min-h-screen pt-32">
        <LoginForm />
      </main>
    );
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-black p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Roulette</h1>
            <div className="text-xl">Balance: ${balance}</div>
          </div>

          {/* Chip selection */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Select Chip</h2>
            <div className="flex gap-4 justify-center">
              {[1, 5, 25, 100, 500, 1000].map((value) => (
                <button
                  key={value}
                  onClick={() => setBetAmount(value)}
                  disabled={value > balance || spinning}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${value === 100 ? 'text-white' : 'text-black'} font-bold
                    ${getChipColor(value)} border-2 border-white/20
                    ${selectedChip === value ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
                    disabled:opacity-50 transform hover:scale-110 transition-transform`}
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          <RouletteBoard 
            onBetPlaced={handleBetPlacement}
            disabled={spinning}
            placedBets={placedBets}
            result={result}
            spinning={spinning}
          />

          <div className="mt-8">
            {/* Spin button */}
            <button
              onClick={spin}
              disabled={spinning || !selectedBet || currentBet === 0}
              className="bg-zinc-800 px-6 py-2 rounded-full disabled:opacity-50 w-full"
            >
              {spinning ? 'Spinning...' : 'Spin'}
            </button>

            {/* Result display with animation */}
            {result !== null && !spinning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, rotate: 360 }}
                transition={{ duration: 1 }}
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

            {!spinning && result !== null && (
              <button
                onClick={startNewGame}
                className="mt-4 bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500 w-full"
              >
                New Game
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 