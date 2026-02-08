import React from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginAdmin = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Aqui futuramente faremos o fetch para o seu backend Java
        navigate('/admin/painel');
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600/20 p-4 rounded-full mb-4">
                        <ShieldCheck className="text-blue-500" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h1>
                    <p className="text-slate-400 text-sm">Painel de Controle ONG Tatuí</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Usuário</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Seu usuário"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-blue-900/20"
                    >
                        Entrar na Central
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;