'use client';

import { motion } from 'framer-motion';
import { BetType } from '../types/roulette';
import { PlacedBet } from '../types/roulette';

interface RouletteBoardProps {
  onBetPlaced: (betType: BetType) => void;
  disabled: boolean;
  placedBets: PlacedBet[];
  result: number | null;
  spinning: boolean;
}

export default function RouletteBoard({ onBetPlaced, disabled, placedBets, result, spinning }: RouletteBoardProps) {
  const numbers = Array.from({ length: 37 }, (_, i) => i);
  
  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const handleNumberClick = (number: number) => {
    onBetPlaced({
      type: 'straight',
      numbers: [number],
      payout: 35,
      position: `number-${number}`
    });
  };

  const handleOutsideBet = (type: BetType['type'], numbers: number[], payout: number) => {
    onBetPlaced({
      type,
      numbers,
      payout,
      position: `outside-${type}`
    });
  };

  const getBetIndicator = (position: string) => {
    if (spinning) return null;
    const betsOnPosition = placedBets.filter(bet => bet.betType.position === position);
    if (betsOnPosition.length === 0) return null;

    // Group bets by chip value
    const groupedBets = betsOnPosition.reduce((acc, bet) => {
      acc[bet.amount] = (acc[bet.amount] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return (
      <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 justify-end max-w-[80%]">
        {Object.entries(groupedBets).map(([amount, count]) => (
          <div
            key={amount}
            className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-black font-bold
              ${getChipColor(Number(amount))} border border-white/20`}
          >
            {count > 1 ? count : ''}
          </div>
        ))}
      </div>
    );
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

  const isWinningPosition = (position: string) => {
    if (!result) return false;

    // For straight bets (numbers)
    if (position.startsWith('number-')) {
      const number = parseInt(position.split('-')[1]);
      return number === result;
    }

    // For outside bets
    if (position.startsWith('outside-')) {
      const betType = position.split('-')[1];
      
      switch (betType) {
        case 'red':
          return getNumberColor(result) === 'red';
        case 'black':
          return getNumberColor(result) === 'black';
        case 'even':
          return result !== 0 && result % 2 === 0;
        case 'odd':
          return result % 2 === 1;
        case '1-18':
          return result >= 1 && result <= 18;
        case '19-36':
          return result >= 19 && result <= 36;
        default:
          return false;
      }
    }

    return false;
  };

  // Update the className in buttons to include conditional border
  const getButtonClassName = (baseClass: string, position: string) => {
    return `${baseClass} ${isWinningPosition(position) ? 'ring-2 ring-white' : ''}`;
  };

  return (
    <div className="bg-green-800 p-4 rounded-lg max-w-2xl mx-auto">
      {/* Numbers section */}
      <div className="mb-4">
        <div className="flex gap-1">
          {/* Zero */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNumberClick(0)}
            disabled={disabled}
            className={getButtonClassName("relative bg-green-600 p-2 rounded-lg w-8 h-38 flex items-center justify-center text-sm hover:bg-green-500 disabled:opacity-50", 'number-0')}
          >
            0
            {getBetIndicator('number-0')}
          </motion.button>

          {/* Numbers 1-36 */}
          <div className="grid grid-cols-12 gap-1 flex-1">
            {numbers.slice(1).map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNumberClick(num)}
                disabled={disabled}
                className={getButtonClassName(
                  `relative p-2 rounded-lg aspect-square flex items-center justify-center text-sm
                  ${getNumberColor(num) === 'red' ? 'bg-red-600 hover:bg-red-500' : 
                    'bg-zinc-900 hover:bg-zinc-800'} disabled:opacity-50`,
                  `number-${num}`
                )}
              >
                {num}
                {getBetIndicator(`number-${num}`)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Outside bets */}
      <div className="grid grid-cols-6 gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('red', [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36], 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-red-600 p-2 rounded-lg hover:bg-red-500 disabled:opacity-50",
            "outside-red"
          )}
        >
          Red
          {getBetIndicator('outside-red')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('black', [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35], 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-zinc-900 p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50",
            "outside-black"
          )}
        >
          Black
          {getBetIndicator('outside-black')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('even', numbers.filter(n => n > 0 && n % 2 === 0), 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50",
            "outside-even"
          )}
        >
          Even
          {getBetIndicator('outside-even')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('odd', numbers.filter(n => n > 0 && n % 2 === 1), 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50",
            "outside-odd"
          )}
        >
          Odd
          {getBetIndicator('outside-odd')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('1-18', numbers.filter(n => n > 0 && n <= 18), 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50",
            "outside-1-18"
          )}
        >
          1-18
          {getBetIndicator('outside-1-18')}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => handleOutsideBet('19-36', numbers.filter(n => n >= 19 && n <= 36), 2)}
          disabled={disabled}
          className={getButtonClassName(
            "relative bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50",
            "outside-19-36"
          )}
        >
          19-36
          {getBetIndicator('outside-19-36')}
        </motion.button>
      </div>
    </div>
  );
}