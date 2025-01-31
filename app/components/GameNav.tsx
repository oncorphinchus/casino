'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@/app/context/UserContext';

export default function GameNav() {
  const { user, logout } = useUser();

  return (
    <nav className="backdrop-blur-lg bg-black/30 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold hover:text-gray-300">
            iCasino
          </Link>
          <div className="flex items-center space-x-8">
            <Link href="/games/blackjack" className="hover:text-gray-300">Blackjack</Link>
            <Link href="/games/roulette" className="hover:text-gray-300">Roulette</Link>
            {user && (
              <>
                <Link href="/profile" className="hover:text-gray-300">Profile</Link>
                <span className="text-gray-400">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-400"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 