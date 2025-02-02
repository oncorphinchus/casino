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

type GameStatus = 'betting' | 'playing' | 'dealer' | 'ended' | 'splitting';

type Hand = {
  cards: Card[];
  bet: number;
  canHit: boolean;
  isDoubled: boolean;
  isBlackjack: boolean;
};

export default function Blackjack() {
  const { user } = useUser();
  const { balance, updateBalance } = useCurrency();
  const [currentBet, setCurrentBet] = useState(0);
  const [hands, setHands] = useState<Hand[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('betting');
  const [message, setMessage] = useState<string>('');
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [continueWithSameBet, setContinueWithSameBet] = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen pt-32">
        <LoginForm />
      </main>
    );
  }

  const calculateScore = (cards: Card[]) => {
    let score = 0;
    let aces = 0;

    // First count non-aces
    cards.forEach(card => {
      if (card.value === 'A') {
        aces += 1;
      } else {
        score += card.score;
      }
    });

    // Then add aces
    for (let i = 0; i < aces; i++) {
      if (score + 11 <= 21) {
        score += 11;
      } else {
        score += 1;
      }
    }

    return score;
  };

  const initializeGame = () => {
    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    
    const playerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    const dealerInitialCards = [shuffledDeck.pop()!, shuffledDeck.pop()!];
    
    const initialHand: Hand = {
      cards: playerInitialCards,
      bet: currentBet,
      canHit: true,
      isDoubled: false,
      isBlackjack: false
    };

    setDeck(shuffledDeck);
    setHands([initialHand]);
    setDealerHand(dealerInitialCards);
    setActiveHandIndex(0);
    setMessage('');

    // Check for dealer blackjack
    if (calculateScore(dealerInitialCards) === 21) {
      if (calculateScore(playerInitialCards) === 21) {
        // Push - both have blackjack
        updateBalance(currentBet);
        setMessage('Push - Both have Blackjack!');
      } else {
        setMessage('Dealer Blackjack!');
      }
      setGameStatus('ended');
      return;
    }

    // Check for player blackjack
    if (calculateScore(playerInitialCards) === 21) {
      const blackjackPayout = currentBet * 2.5; // 3:2 payout
      setMessage('Blackjack! 3:2 Payout!');
      updateBalance(blackjackPayout);
      setGameStatus('ended');
      return;
    }

    setGameStatus('playing');
  };

  const handleBlackjack = () => {
    const blackjackPayout = currentBet * 2.5; // 3:2 payout
    setMessage('Blackjack! 3:2 Payout!');
    updateBalance(blackjackPayout);
    setGameStatus('ended');
  };

  const handleDealerBlackjack = () => {
    setGameStatus('ended');
    // Return original bet if player also has blackjack (push)
    if (calculateScore(hands[0].cards) === 21) {
      updateBalance(currentBet);
      setMessage('Push - Both have Blackjack!');
    } else {
      setMessage('Dealer Blackjack!');
    }
  };

  const canSplit = (hand: Hand) => {
    return hand.cards.length === 2 && 
           hand.cards[0].value === hand.cards[1].value &&
           hands.length < 4 && // Limit splits to 3 times (4 hands total)
           balance >= currentBet;
  };

  const split = () => {
    const currentHand = hands[activeHandIndex];
    if (!canSplit(currentHand)) return;

    const newHands = [...hands];
    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];

    // Create two new hands from the split
    newHands[activeHandIndex] = {
      cards: [card1, deck[0]],
      bet: currentBet,
      canHit: true,
      isDoubled: false,
      isBlackjack: false
    };

    newHands.splice(activeHandIndex + 1, 0, {
      cards: [card2, deck[1]],
      bet: currentBet,
      canHit: true,
      isDoubled: false,
      isBlackjack: false
    });

    // Update deck and balance
    const newDeck = [...deck.slice(2)];
    setDeck(newDeck);
    setHands(newHands);
    updateBalance(-currentBet); // Charge for the additional bet
  };

  const doubleDown = () => {
    if (balance < currentBet) return;

    const newHands = [...hands];
    const currentHand = newHands[activeHandIndex];
    const newCard = deck.pop()!;

    currentHand.cards.push(newCard);
    currentHand.isDoubled = true;
    currentHand.canHit = false;

    updateBalance(-currentBet); // Charge for doubling
    currentHand.bet *= 2;

    setHands(newHands);
    setDeck(deck);

    if (calculateScore(currentHand.cards) > 21) {
      moveToNextHand();
    }
  };

  const canDoubleDown = (hand: Hand) => {
    return hand.cards.length === 2 && 
           balance >= currentBet &&
           !hand.isDoubled;
  };

  const moveToNextHand = () => {
    if (activeHandIndex < hands.length - 1) {
      setActiveHandIndex(activeHandIndex + 1);
    } else {
      setGameStatus('dealer');
      playDealerHand();
    }
  };

  const hit = () => {
    if (gameStatus !== 'playing') return;
    
    const newHands = [...hands];
    const currentHand = newHands[activeHandIndex];
    
    if (!currentHand.canHit) return;

    const newCard = deck.pop()!;
    currentHand.cards.push(newCard);
    
    setHands(newHands);
    setDeck(deck);

    if (calculateScore(currentHand.cards) > 21) {
      currentHand.canHit = false;
      moveToNextHand();
    }
  };

  const stand = () => {
    moveToNextHand();
  };

  const playDealerHand = () => {
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    while (calculateScore(currentDealerHand) < 17) {
      const newCard = currentDeck.pop()!;
      currentDealerHand.push(newCard);
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);
    handleGameEnd(currentDealerHand);
  };

  const handleGameEnd = (finalDealerHand: Card[]) => {
    const dealerScore = calculateScore(finalDealerHand);
    let totalWinnings = 0;

    hands.forEach(hand => {
      const playerScore = calculateScore(hand.cards);
      
      if (hand.isBlackjack) {
        totalWinnings += hand.bet * 2.5; // 3:2 payout for blackjack
      } else if (playerScore <= 21) {
        if (dealerScore > 21 || playerScore > dealerScore) {
          totalWinnings += hand.bet * 2; // Regular win
        } else if (playerScore === dealerScore) {
          totalWinnings += hand.bet; // Push
        }
      }
    });

    if (totalWinnings > 0) {
      updateBalance(totalWinnings);
    }
    
    setGameStatus('ended');
    setMessage(`Game Over! Winnings: $${totalWinnings}`);
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

  const placeBet = async (amount: number) => {
    if (amount <= balance && gameStatus === 'betting') {
      try {
        await updateBalance(-amount);
        setCurrentBet(amount);
        initializeGame();
      } catch (error) {
        console.error('Error placing bet:', error);
        setGameStatus('betting');
      }
    }
  };

  const playAgain = () => {
    if (continueWithSameBet && currentBet <= balance) {
      // First reset all game states except currentBet
      setHands([]);
      setDealerHand([]);
      setDeck([]);
      setMessage('');
      setActiveHandIndex(0);
      // Directly call initializeGame instead of going through placeBet
      updateBalance(-currentBet).then(() => {
        initializeGame();
      });
    } else {
      // Reset everything including bet amount
      setHands([]);
      setDealerHand([]);
      setDeck([]);
      setMessage('');
      setActiveHandIndex(0);
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
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max={balance}
                  value={currentBet}
                  onChange={(e) => setCurrentBet(Number(e.target.value))}
                  className="w-full"
                />
                <button
                  onClick={() => placeBet(currentBet)}
                  disabled={currentBet > balance}
                  className="bg-zinc-800 px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-zinc-700 w-full"
                >
                  Custom Bet: ${currentBet}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl mb-4">
                  Dealer's Hand ({gameStatus === 'playing' ? 
                    calculateScore([dealerHand[0]]) // Only calculate score of first card during play
                    : calculateScore(dealerHand)})
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

              {hands.map((hand, index) => (
                <div 
                  key={index}
                  className={`mb-8 ${index === activeHandIndex && gameStatus === 'playing' ? 'ring-2 ring-white p-4 rounded-lg' : ''}`}
                >
                  <h2 className="text-xl mb-4">
                    Hand {index + 1} ({calculateScore(hand.cards)}) - Bet: ${hand.bet}
                    {hand.isBlackjack && ' - Blackjack!'}
                    {hand.isDoubled && ' - Doubled'}
                  </h2>
                  <div className="flex gap-4">
                    {hand.cards.map((card, cardIndex) => (
                      <motion.div
                        key={cardIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white text-black p-4 rounded-lg w-16 h-24 flex items-center justify-center"
                      >
                        {card.value}{card.suit}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-2xl my-8"
                >
                  {message}
                </motion.div>
              )}

              {gameStatus === 'playing' && hands[activeHandIndex] && (
                <div className="space-x-4">
                  <button
                    onClick={hit}
                    disabled={!hands[activeHandIndex].canHit}
                    className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700 disabled:opacity-50"
                  >
                    Hit
                  </button>
                  <button
                    onClick={stand}
                    className="bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700"
                  >
                    Stand
                  </button>
                  {canDoubleDown(hands[activeHandIndex]) && (
                    <button
                      onClick={doubleDown}
                      className="bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500"
                    >
                      Double Down
                    </button>
                  )}
                  {canSplit(hands[activeHandIndex]) && (
                    <button
                      onClick={split}
                      className="bg-purple-600 px-6 py-2 rounded-full hover:bg-purple-500"
                    >
                      Split
                    </button>
                  )}
                </div>
              )}

              {gameStatus === 'ended' && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={continueWithSameBet}
                        onChange={(e) => setContinueWithSameBet(e.target.checked)}
                        className="form-checkbox rounded bg-zinc-800"
                      />
                      <span>Continue with same bet</span>
                    </label>
                  </div>
                  <button
                    onClick={playAgain}
                    className="bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-500 w-full"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 