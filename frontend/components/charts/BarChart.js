import React from 'react';

const BarChart = ({ data }) => {
  if (!data || !data.length) return null;

  // Find the max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Object.values(d).filter(v => typeof v === 'number'))
  );

  // Get numeric keys for bars and string key for labels
  const keys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
  const labelKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'string');

  return (
    <div className="w-full h-[300px] relative p-4">
      <div className="flex items-end h-full space-x-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            {keys.map(key => (
              <div
                key={key}
                className="w-full bg-foreground rounded-t"
                style={{
                  height: `${(item[key] / maxValue) * 100}%`,
                  minHeight: '1px'
                }}
                title={`${key}: ${item[key]}`}
              />
            ))}
            <div className="text-sm mt-2 truncate w-full text-center">
              {item[labelKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;