import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SpeciesChart = ({ data }) => {
  const chartData = [
    { name: 'Cães', value: data?.caes || 0 },
    { name: 'Gatos', value: data?.gatos || 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
      <h3 className="text-white font-black italic uppercase text-xs mb-6">Distribuição de Espécies</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpeciesChart;