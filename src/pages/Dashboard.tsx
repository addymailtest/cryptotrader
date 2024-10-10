import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const Dashboard: React.FC = () => {
  const { user, userData } = useAuth();

  const {
    data: cryptoData,
    isLoading,
    error,
  } = useQuery<CryptoData[]>(
    'cryptoData',
    async () => {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
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
      refetchInterval: 60000, // Refetch every minute
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  const portfolioValue = userData?.portfolio
    ? Object.entries(userData.portfolio).reduce((total, [coinId, amount]) => {
        const coin = cryptoData?.find((c) => c.id === coinId);
        return total + (coin ? coin.current_price * amount : 0);
      }, 0)
    : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
          <p className="text-2xl font-bold">${userData?.balance.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-2xl font-bold">${portfolioValue.toFixed(2)}</p>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Your Portfolio</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Coin</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {userData?.portfolio &&
              Object.entries(userData.portfolio).map(([coinId, amount]) => {
                const coin = cryptoData?.find((c) => c.id === coinId);
                if (!coin || amount === 0) return null;
                return (
                  <tr key={coinId} className="border-b">
                    <td className="px-4 py-2 flex items-center">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-6 h-6 mr-2"
                      />
                      <Link
                        to={`/crypto/${coinId}`}
                        className="text-blue-500 hover:underline"
                      >
                        {coin.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{amount}</td>
                    <td className="px-4 py-2">
                      ${(coin.current_price * amount).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <h3 className="text-xl font-semibold mb-2">Top 100 Cryptocurrencies</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Symbol</th>
              <th className="px-4 py-2">Price (USD)</th>
              <th className="px-4 py-2">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData?.map((crypto) => (
              <tr key={crypto.id} className="border-b">
                <td className="px-4 py-2">
                  <Link
                    to={`/crypto/${crypto.id}`}
                    className="flex items-center text-blue-500 hover:underline"
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 mr-2"
                    />
                    {crypto.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{crypto.symbol.toUpperCase()}</td>
                <td className="px-4 py-2">
                  ${crypto.current_price.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-2 ${
                    crypto.price_change_percentage_24h > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
