import React from 'react';
import { User, Bell, Search } from 'lucide-react';

const AdminHeader = () => {
    return (
        <header className="h-16 bg-[#0f172a]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8">
            {/* Busca Rápida (Estilo IDE) */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar pet ou CPF..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>

            {/* Perfil e Notificações */}
            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-[#0f172a]"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-slate-800"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white">Eng. Cristiano</p>
                        <p className="text-[10px] text-blue-500 uppercase font-black">Administrador</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700">
                        C
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;