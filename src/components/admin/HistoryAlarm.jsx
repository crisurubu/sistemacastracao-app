import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const HistoryAlarm = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-white font-black italic uppercase text-sm tracking-widest">
                    Alarmes de Espera Crítica
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((pet, index) => (
                    <div key={index} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold text-sm">{pet.nomePet}</p>
                            <p className="text-slate-500 text-xs">{pet.tutorNome}</p>
                        </div>
                        <div className="text-right">
                            <span className="flex items-center gap-1 text-red-400 text-[10px] font-black italic">
                                <Clock size={12} /> {pet.diasEspera} DIAS
                            </span>
                            <p className="text-[9px] text-slate-600 uppercase font-bold">Aguardando Vaga</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryAlarm;