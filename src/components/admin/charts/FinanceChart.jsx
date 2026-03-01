import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BadgeDollarSign } from 'lucide-react';

const darkTooltipStyle = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '10px', color: '#fff' };

const FinanceChart = ({ data }) => (
    <div className="bg-[#1e293b] border border-slate-800 p-8 rounded-[2.5rem]">
        <h3 className="text-white font-black italic uppercase text-sm mb-6 flex items-center gap-2">
            <BadgeDollarSign className="text-emerald-500" size={18}/> Fluxo de Arrecadação
        </h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="mes" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={darkTooltipStyle} />
                    <Legend iconType="circle" verticalAlign="top" align="right" />
                    <Bar dataKey="confirmados" name="Confirmado (R$)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="pendentes" name="Aguardando (R$)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default FinanceChart;