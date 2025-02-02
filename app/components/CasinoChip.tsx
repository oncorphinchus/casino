'use client';

import { motion } from 'framer-motion';

interface CasinoChipProps {
  value: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CasinoChip({ value, isSelected, onClick }: CasinoChipProps) {
  const chipColors = {
    1: 'bg-white',
    5: 'bg-red-500',
    25: 'bg-green-500',
    100: 'bg-black',
    500: 'bg-purple-500',
    1000: 'bg-yellow-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-16 h-16 rounded-full ${chipColors[value as keyof typeof chipColors]} 
        border-4 border-white/20 flex items-center justify-center cursor-pointer
        ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
    >
      <span className={`text-lg font-bold ${value === 100 ? 'text-white' : 'text-black'}`}>
        ${value}
      </span>
    </motion.div>
  );
} 