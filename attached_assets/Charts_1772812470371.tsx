import React from 'react';

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  isDonut?: boolean;
}

const ChartLegend: React.FC<{ data: { label: string; color: string }[] }> = ({ data }) => (
  <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
    {data.map((item, index) => (
      <div key={index} className="flex items-center">
        <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
        <span className="text-sm text-text-secondary">{item.label}</span>
      </div>
    ))}
  </div>
);

export const PieChart: React.FC<PieChartProps> = ({ data, isDonut = false }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
      return <div className="flex items-center justify-center h-48 text-gray-500">কোনো ডেটা নেই</div>;
  }

  let cumulativePercent = 0;
  const radius = 85;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map(item => {
    const percent = (item.value / total) * 100;
    const sliceData = {
        ...item,
        percent,
        startAngle: (cumulativePercent / 100) * 360,
    };
    cumulativePercent += percent;
    return sliceData;
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {slices.map((slice, index) => (
          <circle
            key={index}
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (slice.percent / 100) * circumference}
            transform={`rotate(${slice.startAngle} 100 100)`}
          />
        ))}
        {isDonut && <circle cx="100" cy="100" r={radius - (strokeWidth / 2)} fill="white" />}
      </svg>
      <ChartLegend data={data} />
    </div>
  );
};


interface BarChartProps {
  data: { label: string; value: number }[];
  color: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color }) => {
  if (data.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-500">কোনো ডেটা নেই</div>;
  }
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  const formatValue = (value: number) => {
    if (value >= 1000) {
        return `${(value / 1000).toLocaleString('bn-BD')}k`;
    }
    return value.toLocaleString('bn-BD');
  }

  return (
    <div className="h-64 flex flex-col">
        <div className="flex-grow flex items-end space-x-2 px-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-text-secondary -mb-1 z-10 bg-white px-1">{formatValue(item.value)}</div>
                    <div 
                        className="w-full rounded-t-md" 
                        style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: color, minHeight: '2px' }}
                        title={`${item.label}: ${item.value.toLocaleString('bn-BD')}`}
                    ></div>
                </div>
            ))}
        </div>
        <div className="flex justify-around mt-2 border-t pt-2">
            {data.map((item, index) => (
                <div key={index} className="flex-1 text-center text-xs text-text-secondary font-medium">
                    {item.label}
                </div>
            ))}
        </div>
    </div>
  );
};
