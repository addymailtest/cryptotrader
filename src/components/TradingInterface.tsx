import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TradingInterfaceProps {
  coinId: string;
  coinName: string;
  currentPrice: number;
}

const TradingInterface: React.FC<TradingInterfaceProps> = ({
  coinId,
  coinName,
  currentPrice,
}) => {
  const { userData, updateUserData } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!userData) return;

    const totalCost = amount * currentPrice;
    if (action === 'buy') {
      if (totalCost > userData.balance) {
        setError('Insufficient funds');
        return;
      }
      const newBalance = userData.balance - totalCost;
      const newPortfolio = {
        ...userData.portfolio,
        [coinId]: (userData.portfolio[coinId] || 0) + amount,
      };
      const newTradeHistory = [
        ...userData.tradeHistory,
        {
          coinId,
          action: 'buy',
          amount,
          price: currentPrice,
          timestamp: Date.now(),
        },
      ];
      await updateUserData({ balance: newBalance, portfolio: newPortfolio, tradeHistory: newTradeHistory });
      setError(null);
    } else {
      const currentAmount = userData.portfolio[coinId] || 0;
      if (amount > currentAmount) {
        setError('Insufficient coins in portfolio');
        return;
      }
      const newBalance = userData.balance + totalCost;
      const newPortfolio = {
        ...userData.portfolio,
        [coinId]: currentAmount - amount,
      };
      const newTradeHistory = [
        ...userData.tradeHistory,
        {
          coinId,
          action: 'sell',
          amount,
          price: currentPrice,
          timestamp: Date.now(),
        },
      ];
      await updateUserData({ balance: newBalance, portfolio: newPortfolio, tradeHistory: newTradeHistory });
      setError(null);
    }
    setAmount(0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Trade {coinName}</h3>
      <p className="mb-2">Current Price: ${currentPrice.toFixed(2)}</p>
      <p className="mb-2">Balance: ${userData?.balance.toFixed(2)}</p>
      <p className="mb-2">
        Owned: {userData?.portfolio[coinId] || 0} {coinName}
      </p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full p-2 mb-2 border rounded"
        placeholder="Amount"
      />
      <div className="flex justify-between">
        <button
          onClick={() => handleTrade('buy')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Buy
        </button>
        <button
          onClick={() => handleTrade('sell')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sell
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TradingInterface;