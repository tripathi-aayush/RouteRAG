import React from 'react';

export const BarChart = ({ data }) => {
  if (!data || !data.length) return null;

  // Find the max value for scaling
  const maxValue = Math.max(...data.map(d => Object.values(d).filter(v => typeof v === 'number')));

  // Get all numeric keys for the bars
  const keys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
  const labelKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'string');

  return (
    <div className="w-full h-[300px] relative">
      <div className="flex items-end h-full space-x-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            {keys.map(key => (
              <div
                key={key}
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${(item[key] / maxValue) * 100}%`,
                  minHeight: '1px'
                }}
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