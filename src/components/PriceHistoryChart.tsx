import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

interface PriceHistoryChartProps {
  coinId: string;
  coinName: string;
  priceHistory: number[];
  labels: string[];
  ohlcData: { t: number; o: number; h: number; l: number; c: number }[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  // coinId,
  coinName,
  priceHistory,
  labels,
  // ohlcData,
}) => {
  // const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  const lineChartData = {
    labels,
    datasets: [
      {
        label: `${coinName} Price`,
        data: priceHistory,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // const candlestickChartData = {
  //   labels,
  //   datasets: [
  //     {
  //       label: `${coinName} OHLC`,
  //       data: ohlcData,
  //     },
  //   ],
  // };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${coinName} Price History`,
      },
    },
  };

  return (
    <div>
      <div className="mb-4">
        {/* <button
          className={`mr-2 px-4 py-2 rounded ${
            chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setChartType('line')}
        >
          Line Chart
        </button>
        <button
          className={`px-4 py-2 rounded ${
            chartType === 'candlestick'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setChartType('candlestick')}
        >
          Candlestick Chart
        </button> */}
      </div>
      <Line options={options} data={lineChartData} />
    </div>
  );
};

export default PriceHistoryChart;
