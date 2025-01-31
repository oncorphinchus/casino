'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/app/context/UserContext';
import RegisterForm from './RegisterForm';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, error } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password) {
      await login(username, password);
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-zinc-900 rounded-2xl"
    >
      {isRegistering ? (
        <RegisterForm onToggle={toggleForm} />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Login to Play</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-white"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-white"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-800 px-6 py-2 rounded-full hover:bg-zinc-700"
            >
              Login
            </button>
            <button
              type="button"
              onClick={toggleForm}
              className="w-full text-gray-400 hover:text-white"
            >
              Don't have an account? Register
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
} 