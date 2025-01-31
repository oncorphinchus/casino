'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/app/context/CurrencyContext';
import GameNav from '@/app/components/GameNav';
import { useUser } from '@/app/context/UserContext';
import LoginForm from '@/app/components/LoginForm';

type BetType = 'red' | 'black' | 'green' | number;

export default function Roulette() {
  const { user } = useUser();
  const { balance, updateBalance } = useCurrency();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [currentBet, setCurrentBet] = useState(0);
  
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
      updateBalance(-amount);
    }
  };

  const calculateWinnings = (result: number, bet: BetType, amount: number) => {
    if (typeof bet === 'number') {
      // Single number bet pays 35 to 1
      return bet === result ? amount * 36 : 0;
    } else {
      // Color bets pay 1 to 1
      const resultColor = getNumberColor(result);
      return bet === resultColor ? amount * 2 : 0;
    }
  };

  const spin = () => {
    if (!selectedBet || currentBet === 0) return;
    
    setSpinning(true);
    const randomNumber = Math.floor(Math.random() * 37);
    
    setTimeout(() => {
      setResult(randomNumber);
      setSpinning(false);
      
      // Calculate and award winnings
      const winnings = calculateWinnings(randomNumber, selectedBet, currentBet);
      if (winnings > 0) {
        updateBalance(winnings);
      }
      
      // Reset bet
      setCurrentBet(0);
      setSelectedBet(null);
    }, 3000);
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

          {/* Bet amount selection */}
          <div className="mb-8">
            <h2 className="text-2xl mb-4">Select Bet Amount</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[10, 25, 50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={amount > balance || spinning}
                  className={`p-4 rounded-lg bg-zinc-800 ${
                    currentBet === amount ? 'ring-2 ring-white' : ''
                  } disabled:opacity-50`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max={balance}
              value={currentBet}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-white"
              placeholder="Custom Bet Amount"
            />
          </div>

          {/* Color betting options */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => placeBet('red')}
              disabled={spinning}
              className={`p-4 rounded-lg bg-red-600 ${
                selectedBet === 'red' ? 'ring-2 ring-white' : ''
              }`}
            >
              Red
            </button>
            <button
              onClick={() => placeBet('black')}
              disabled={spinning}
              className={`p-4 rounded-lg bg-zinc-900 ${
                selectedBet === 'black' ? 'ring-2 ring-white' : ''
              }`}
            >
              Black
            </button>
            <button
              onClick={() => placeBet('green')}
              disabled={spinning}
              className={`p-4 rounded-lg bg-green-600 ${
                selectedBet === 'green' ? 'ring-2 ring-white' : ''
              }`}
            >
              Green (0)
            </button>
          </div>

          {/* Number grid */}
          <div className="grid grid-cols-6 gap-2 mb-8">
            {numbers.map((num) => (
              <button
                key={num}
                onClick={() => placeBet(num)}
                disabled={spinning}
                className={`p-4 rounded-lg ${
                  getNumberColor(num) === 'red' ? 'bg-red-600' : 
                  getNumberColor(num) === 'black' ? 'bg-zinc-900' : 'bg-green-600'
                } ${selectedBet === num ? 'ring-2 ring-white' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || !selectedBet || currentBet === 0}
            className="bg-zinc-800 px-6 py-2 rounded-full disabled:opacity-50 w-full"
          >
            {spinning ? 'Spinning...' : 'Spin'}
          </button>
          <button
            onClick={() => updateBalance(1000)} // Refill balance by 1000
            className="bg-green-600 px-6 py-2 rounded-full mt-4 w-full"
          >
            Refill Balance
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
        </div>
      </div>
    </>
  );
} 