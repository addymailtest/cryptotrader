import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PriceHistoryChart from '../components/PriceHistoryChart';
import TradingInterface from '../components/TradingInterface';

interface CryptoDetailsData {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
  };
  description: {
    en: string;
  };
}

interface PriceHistoryData {
  prices: [number, number][];
  ohlc: number[][];
}

const CryptoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAuth();

  const {
    data: cryptoData,
    isLoading: isLoadingCrypto,
    error: cryptoError,
  } = useQuery<CryptoDetailsData>(['cryptoDetails', id], async () => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}`,
      {
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': 'CG-S7qzb5av92SbhwpyHrpQZJH1',
        },
      }
    );
    return response.data;
  });

  const {
    data: priceHistoryData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery<PriceHistoryData>(['priceHistory', id], async () => {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=7`,
      {
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': 'CG-S7qzb5av92SbhwpyHrpQZJH1',
        },
      }
    );
    const ohlcData = response.data;
    const prices = ohlcData.map((item: number[]) => [item[0], item[4]]);
    return { prices, ohlc: ohlcData };
  });

  if (isLoadingCrypto || isLoadingHistory) return <div>Loading...</div>;
  if (cryptoError || historyError) return <div>Error fetching data</div>;
  if (!cryptoData || !priceHistoryData) return <div>No data available</div>;

  const labels = priceHistoryData.prices.map(([timestamp]) =>
    new Date(timestamp).toLocaleDateString()
  );

  const priceHistory = priceHistoryData.prices.map(([, price]) => price);

  const ohlcData = priceHistoryData.ohlc.map(
    ([time, open, high, low, close]) => ({
      t: time,
      o: open,
      h: high,
      l: low,
      c: close,
    })
  );

  const coinTradeHistory = userData?.tradeHistory?.filter(
    (trade) => trade.coinId === id
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <img
          src={cryptoData.image.large}
          alt={cryptoData.name}
          className="w-16 h-16 mr-4"
        />
        <div>
          <h1 className="text-3xl font-bold">
            {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
          </h1>
          <p className="text-xl">
            ${cryptoData.market_data.current_price.usd.toFixed(2)} USD
          </p>
          <p
            className={`text-lg ${
              cryptoData.market_data.price_change_percentage_24h >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {cryptoData.market_data.price_change_percentage_24h.toFixed(2)}%
            (24h)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Price History</h2>
          <PriceHistoryChart
            coinId={cryptoData.id}
            coinName={cryptoData.name}
            priceHistory={priceHistory}
            labels={labels}
            ohlcData={ohlcData}
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Trading</h2>
          <TradingInterface
            coinId={cryptoData.id}
            coinName={cryptoData.name}
            currentPrice={cryptoData.market_data.current_price.usd}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Market Data</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
            <p>${cryptoData.market_data.market_cap.usd.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">24h Trading Volume</h3>
            <p>${cryptoData.market_data.total_volume.usd.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Trading History</h2>
        {coinTradeHistory.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {coinTradeHistory?.map((trade, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2">{new Date(trade.timestamp).toLocaleString()}</td>
                    <td className={`px-4 py-2 ${trade.action === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.action.charAt(0).toUpperCase() + trade.action.slice(1)}
                    </td>
                    <td className="px-4 py-2">{trade.amount}</td>
                    <td className="px-4 py-2">${trade.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No trading history for this cryptocurrency.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">About {cryptoData.name}</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p
            dangerouslySetInnerHTML={{ __html: cryptoData.description.en }}
          ></p>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetails;