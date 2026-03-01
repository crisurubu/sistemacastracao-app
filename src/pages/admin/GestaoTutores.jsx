import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, ClipboardList, Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

const GestaoTutores = () => {
    const [tutores, setTutores] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    // Função de busca que será disparada ao carregar ou ao digitar
   const fetchTutores = async (termo = "") => {
    try {
        setLoading(true);
        
        // 1. Remove espaços em branco
        const termoTrim = termo.trim();
        
        // 2. Se o usuário digitou algo com cara de CPF (números, pontos, traços)
        // Vamos mandar apenas os números para a API
        const apenasNumeros = termoTrim.replace(/\D/g, "");
        
        // Se após limpar, restarem números, priorizamos a busca por número
        // Caso contrário (se for nome), mandamos o texto normal
        const query = (apenasNumeros.length > 0 && !isNaN(apenasNumeros)) 
            ? apenasNumeros 
            : termoTrim;

        console.log("Buscando por:", query); // Verifique no console do F12 o que está indo
        
        const response = await api.get(`/admin/tutores?search=${query}`);
        setTutores(response.data);
    } catch (error) {
        console.error("Erro ao buscar tutores:", error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        // Debounce simples: espera o usuário parar de digitar para chamar o banco
        const delayDebounce = setTimeout(() => {
            fetchTutores(busca);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [busca]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Base de Tutores</h1>
                    <p className="text-slate-400 text-sm">Histórico completo e dados de contato dos responsáveis.</p>
                </div>
                
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por CPF ou Nome..." 
                        className="bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:border-blue-500 outline-none text-sm w-full md:w-80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Localizando registros...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tutores.length === 0 ? (
                        <div className="col-span-full p-10 text-center text-slate-500 italic bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                            Nenhum tutor encontrado com o termo "{busca}".
                        </div>
                    ) : (
                        tutores.map(tutor => (
                            <div key={tutor.id} className="bg-[#1e293b] border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-lg group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600/20 p-3 rounded-full text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{tutor.nome}</h3>
                                            <p className="text-slate-500 text-[10px] tracking-widest">CPF: {tutor.cpf}</p>
                                        </div>
                                    </div>
                                    <span className="bg-slate-800 text-blue-400 text-[9px] font-black px-2 py-1 rounded-md uppercase border border-slate-700">
                                        {tutor.quantidadePets} Pet(s)
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail size={14} className="text-slate-600" /> {tutor.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Smartphone size={14} className="text-slate-600" /> {tutor.fone}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => window.location.href = `/admin/tutores/${tutor.id}`}
                                    className="w-full bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-700"
                                >
                                    <ClipboardList size={14} /> Ver Histórico de Vida
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default GestaoTutores;