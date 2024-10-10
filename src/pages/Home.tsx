import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp, DollarSign, PieChart, ArrowRight } from 'lucide-react'
import { useQuery } from 'react-query'
import axios from 'axios'

interface CoinData {
  id: string;
  current_price: number;
}

const Home: React.FC = () => {
  const { user, userData } = useAuth()

  const { data: coinPrices } = useQuery<CoinData[]>(
    'coinPrices',
    async () => {
      if (!userData?.portfolio) return [];
      const coinIds = Object.keys(userData.portfolio).join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        {
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-S7qzb5av92SbhwpyHrpQZJH1',
          },
        }
      );
      return response.data;
    },
    {
      enabled: !!userData?.portfolio,
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const calculatePortfolioValue = () => {
    if (!userData?.portfolio || !coinPrices) return 0;
    return Object.entries(userData.portfolio).reduce((total, [coinId, amount]) => {
      const coin = coinPrices.find(c => c.id === coinId);
      return total + (coin ? coin.current_price * amount : 0);
    }, 0);
  };

  if (user && userData) {
    const portfolioValue = calculatePortfolioValue();

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome back, {user.email}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <DollarSign className="text-green-500 mr-2" size={24} />
              <h2 className="text-2xl font-semibold">Account Balance</h2>
            </div>
            <p className="text-3xl font-bold">${userData.balance.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <PieChart className="text-blue-500 mr-2" size={24} />
              <h2 className="text-2xl font-semibold">Portfolio Value</h2>
            </div>
            <p className="text-3xl font-bold">
              ${portfolioValue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/dashboard" className="flex items-center justify-between bg-blue-100 p-4 rounded-lg hover:bg-blue-200 transition-colors">
              <span className="font-semibold">Go to Dashboard</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/crypto/bitcoin" className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg hover:bg-yellow-200 transition-colors">
              <span className="font-semibold">Check Bitcoin</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Market Overview</h2>
          <p className="mb-4">Stay updated with the latest market trends and make informed decisions.</p>
          <Link to="/dashboard" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            View All Cryptocurrencies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to CryptoTrader</h1>
      <p className="text-xl mb-8">Start trading cryptocurrencies with real-time market data</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <TrendingUp className="text-blue-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Live Market Data</h2>
          <p>Access real-time cryptocurrency prices and market trends</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <DollarSign className="text-green-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Virtual Trading</h2>
          <p>Practice trading with a virtual balance and risk-free environment</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PieChart className="text-purple-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-2">Portfolio Tracking</h2>
          <p>Monitor your cryptocurrency portfolio and performance</p>
        </div>
      </div>
      <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
        Get Started Now
      </Link>
    </div>
  )
}

export default Home