'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/app/context/UserContext';
import LoginForm from '@/app/components/LoginForm';

export function GameCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="bg-zinc-900 p-6 rounded-2xl cursor-pointer"
      >
        <h3 className="text-2xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <main className="min-h-screen pt-32">
        <LoginForm />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <nav className="backdrop-blur-lg bg-black/30 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-semibold">iCasino</div>
            <div className="space-x-8">
              <Link href="/games/blackjack" className="hover:text-gray-300">Blackjack</Link>
              <Link href="/games/roulette" className="hover:text-gray-300">Roulette</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-6"
          >
            Welcome to iCasino
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-12"
          >
            Experience casino games reimagined with elegant design.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GameCard 
              title="Blackjack"
              description="Test your skills against the dealer in this classic card game."
              href="/games/blackjack"
            />
            <GameCard 
              title="Roulette"
              description="Place your bets and watch the wheel spin in this game of chance."
              href="/games/roulette"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
