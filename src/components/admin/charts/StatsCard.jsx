import React from 'react';

const StatsCard = ({ label, value, icon, color }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-white mt-1 group-hover:scale-105 transition-transform origin-left">{value}</h3>
            </div>
            <div className={`${color} bg-slate-950/50 p-4 rounded-2xl`}>{icon}</div>
        </div>
    </div>
);

export default StatsCard;