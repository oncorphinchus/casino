import { useCurrency } from '@/app/context/CurrencyContext';
import { useUser } from '@/app/context/UserContext';
import { useState } from 'react';

export default function Profile() {
  const { user } = useUser();
  const { balance, updateBalance } = useCurrency();
  const [refillAmount, setRefillAmount] = useState(0);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleRefill = () => {
    if (refillAmount > 0) {
      updateBalance(refillAmount);
      setRefillAmount(0);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">User Profile</h1>
      <div className="text-xl mb-4">Username: {user.username}</div>
      <div className="text-xl mb-4">Balance: ${balance}</div>
      <div className="mb-4">
        <input
          type="number"
          min="1"
          value={refillAmount}
          onChange={(e) => setRefillAmount(Number(e.target.value))}
          className="p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-white"
          placeholder="Refill Amount"
        />
        <button
          onClick={handleRefill}
          className="bg-green-600 px-6 py-2 rounded-full ml-4"
        >
          Refill Balance
        </button>
      </div>
    </div>
  );
} 