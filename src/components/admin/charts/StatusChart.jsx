import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatusChart = ({ data }) => {
  const chartData = [
    { status: 'Pendentes', total: data?.pendentes || 0, color: '#f59e0b' },
    { status: 'Agendados', total: data?.agendados || 0, color: '#8b5cf6' },
    { status: 'Realizados', total: data?.realizados || 0, color: '#10b981' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
      <h3 className="text-white font-black italic uppercase text-xs mb-6">Status dos Processos</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="status" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} />
            <YAxis hide />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
            <Bar dataKey="total" radius={[10, 10, 10, 10]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusChart;