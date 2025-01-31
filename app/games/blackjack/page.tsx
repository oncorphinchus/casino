'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/app/context/CurrencyContext';
import GameNav from '@/app/components/GameNav';
import { useUser } from '@/app/context/UserContext';
import LoginForm from '@/app/components/LoginForm';

type Card = {
  suit: string;
  value: string;
  score: number;
};

type GameStatus = 'betting' | 'playing' | 'dealer' | 'ended';

export default function Blackjack() {
  const { user } = useUser();
  const { balance, updateBalance } = useCurrency();
  const [currentBet, setCurrentBet] = useState(0);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('betting');
  const [message, setMessage] = useState<string>('');
  const [continueWithSameBet, setContinueWithSameBet] = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen pt-32">
        <LoginForm />
      </main>
    );
  }

  const initializeGame = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    
    const playerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    const dealerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    
    setDeck(shuffledDeck);
    setPlayerHand(playerInitialCards);
    setDealerHand(dealerInitialCards);
    setMessage('');
    
    if (continueWithSameBet) {
      updateBalance(-currentBet);
      setGameStatus('playing');
      setContinueWithSameBet(false);
    }
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

  const placeBet = (amount: number) => {
    if (amount <= balance && gameStatus === 'betting') {
      setCurrentBet(amount);
      updateBalance(-amount);
      initializeGame();
      setGameStatus('playing');
    }
  };

  const hit = () => {
    if (gameStatus !== 'playing') return;
    
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(deck);

    if (calculateScore(newHand) > 21) {
      handleGameEnd(newHand, dealerHand);
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
    handleGameEnd(playerHand, currentDealerHand);
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

  const handleGameEnd = (finalPlayerHand: Card[], finalDealerHand: Card[]) => {
    const playerScore = calculateScore(finalPlayerHand);
    const dealerScore = calculateScore(finalDealerHand);
    
    if (playerScore > 21) {
      setMessage('Bust! You lose!');
    } else if (dealerScore > 21) {
      setMessage('Dealer busts! You win!');
      updateBalance(currentBet * 2);
    } else if (playerScore > dealerScore) {
      setMessage('You win!');
      updateBalance(currentBet * 2);
    } else if (playerScore === dealerScore) {
      setMessage('Push!');
      updateBalance(currentBet);
    } else {
      setMessage('Dealer wins!');
    }
    
    setGameStatus('ended');
  };

  const startNewGame = (continueBet = false) => {
    if (continueBet) {
      setGameStatus('playing');
      setPlayerHand([]);
      setDealerHand([]);
      setContinueWithSameBet(true);
      initializeGame();
    } else {
      setPlayerHand([]);
      setDealerHand([]);
      setCurrentBet(0);
      setGameStatus('betting');
    }
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-black p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Blackjack</h1>
            <div className="text-xl">Balance: ${balance}</div>
          </div>

          {gameStatus === 'betting' ? (
            <div className="space-y-4">
              <h2 className="text-2xl mb-4">Place Your Bet</h2>
              <div className="grid grid-cols-3 gap-4">
                {[10, 25, 50, 100, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    disabled={amount > balance}
                    className="bg-zinc-800 px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-zinc-700"
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
                onChange={(e) => setCurrentBet(Number(e.target.value))}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-white"
                placeholder="Custom Bet Amount"
              />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl mb-4">
                  Dealer's Hand ({calculateScore(dealerHand)})
                  {gameStatus === 'playing' && <span className="text-sm ml-2">(One card hidden)</span>}
                </h2>
                <div className="flex gap-4">
                  {dealerHand.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white text-black p-4 rounded-lg w-16 h-24 flex items-center justify-center"
                    >
                      {gameStatus === 'playing' && index === 1 ? '?' : `${card.value}${card.suit}`}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl mb-4">Your Hand ({calculateScore(playerHand)}) - Current Bet: ${currentBet}</h2>
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

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-2xl mb-8"
                >
                  {message}
                </motion.div>
              )}

              <div className="space-x-4">
                {gameStatus === 'playing' ? (
                  <>
                    <button
                      onClick={hit}
                      className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700"
                    >
                      Hit
                    </button>
                    <button
                      onClick={stand}
                      className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700"
                    >
                      Stand
                    </button>
                  </>
                ) : gameStatus === 'ended' && (
                  <>
                    <button
                      onClick={() => startNewGame()}
                      className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700"
                    >
                      New Game
                    </button>
                    <button
                      onClick={() => {
                        setContinueWithSameBet(true);
                        startNewGame(true);
                      }}
                      className="bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500"
                    >
                      Continue with Same Bet
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 