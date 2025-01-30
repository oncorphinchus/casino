'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Card = {
  suit: string;
  value: string;
  score: number;
};

export default function Blackjack() {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'dealer' | 'ended'>('playing');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    
    const playerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    const dealerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    
    setDeck(shuffledDeck);
    setPlayerHand(playerInitialCards);
    setDealerHand(dealerInitialCards);
    setGameStatus('playing');
  };

  const createDeck = () => {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          score: value === 'A' ? 11 : ['J', 'Q', 'K'].includes(value) ? 10 : parseInt(value)
        });
      }
    }

    return deck;
  };

  const shuffleDeck = (deck: Card[]) => {
    return [...deck].sort(() => Math.random() - 0.5);
  };

  const hit = () => {
    if (gameStatus !== 'playing') return;
    
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck);

    if (calculateScore(newHand) > 21) {
      setGameStatus('ended');
    }
  };

  const stand = () => {
    setGameStatus('dealer');
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    while (calculateScore(currentDealerHand) < 17) {
      const newCard = currentDeck.pop()!;
      currentDealerHand.push(newCard);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);
    setGameStatus('ended');
  };

  const calculateScore = (hand: Card[]) => {
    let score = hand.reduce((total, card) => total + card.score, 0);
    let aces = hand.filter(card => card.value === 'A').length;

    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Blackjack</h1>
        
        <div className="mb-8">
          <h2 className="text-xl mb-4">Dealer's Hand ({calculateScore(dealerHand)})</h2>
          <div className="flex gap-4">
            {dealerHand.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white text-black p-4 rounded-lg w-16 h-24 flex items-center justify-center"
              >
                {card.value}{card.suit}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl mb-4">Your Hand ({calculateScore(playerHand)})</h2>
          <div className="flex gap-4">
            {playerHand.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white text-black p-4 rounded-lg w-16 h-24 flex items-center justify-center"
              >
                {card.value}{card.suit}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={hit}
            disabled={gameStatus !== 'playing'}
            className="bg-zinc-800 px-6 py-2 rounded-full disabled:opacity-50"
          >
            Hit
          </button>
          <button
            onClick={stand}
            disabled={gameStatus !== 'playing'}
            className="bg-zinc-800 px-6 py-2 rounded-full disabled:opacity-50"
          >
            Stand
          </button>
          <button
            onClick={initializeGame}
            className="bg-zinc-800 px-6 py-2 rounded-full"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
} 