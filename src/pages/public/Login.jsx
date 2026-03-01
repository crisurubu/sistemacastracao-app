import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

   const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const loginData = {
        email: email.trim(),
        senha: senha.trim()
    };

    try {
        const response = await api.post('/auth/login', loginData);
        
        const data = response.data;

        const usuarioLogado = data.user || data;
        
        if (!usuarioLogado || !usuarioLogado.nivelAcesso) {
            throw new Error("Perfil de acesso não identificado.");
        }

        login(usuarioLogado);

        const role = String(usuarioLogado.nivelAcesso).toUpperCase().trim();

        if (role === 'CLINICA') {
            navigate('/admin/dashboard-clinica');
        } else {
            navigate('/admin/painel');
        }

    } catch (err) {
        setLoading(false);
        
        // 1. Pegamos os dados do erro (JSON do Spring)
        const erroData = err.response?.data;
        
        // 2. Transformamos o objeto inteiro em String para não ter erro de [object Object]
        // Isso garante que a palavra "inativa" seja encontrada em qualquer campo (message, error, etc)
        const erroTextoTotal = JSON.stringify(erroData || {}).toLowerCase();
        
        // 3. Pegamos a mensagem específica se ela existir
        const mensagemSimples = (erroData?.message || erroData?.error || String(err)).toLowerCase();

        // PRIORIDADE 1: Se o seu Java mandou a palavra do bloqueio
        if (erroTextoTotal.includes("inativa") || mensagemSimples.includes("inativa")) {
            setErro("ACESSO NEGADO: Sua conta está inativa. Contate a administração.");
            return;
        }

        // PRIORIDADE 2: Se não for bloqueio, mas o Java mandou a frase de erro de senha/email
        if (mensagemSimples.includes("incorretos") || err.response?.status === 401) {
            setErro("E-mail ou senha incorretos.");
            return;
        }

        // PRIORIDADE 3: Fallback para erros de rede ou servidor fora
        setErro("Não foi possível conectar ao servidor. Verifique sua conexão.");
    }
};

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 md:p-8 shadow-2xl border border-slate-800">
                
                <div className="mb-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Sistema Castração</h2>
                    <p className="mt-2 text-blue-400 font-black uppercase text-[10px] tracking-widest italic">Área Administrativa</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {erro && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-center text-xs text-red-500 border border-red-500/50 font-black animate-pulse uppercase">
                            {erro}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className="mb-2 text-xs font-black text-slate-400 uppercase">E-mail de Acesso</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@gmail.com"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-xs font-black text-slate-400 uppercase">Senha</label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                tabIndex="-1"
                            >
                                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-xl py-4 text-sm font-black text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${
                            loading
                                ? 'bg-blue-800 cursor-not-allowed opacity-80'
                                : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/40'
                        }`}
                    >
                        {loading ? "Autenticando..." : "Acessar Painel"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-800 pt-6">
                    <p className="text-slate-600 text-[9px] uppercase font-black tracking-widest">
                        Sistema Castracao ong © 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

// --- RESUMO DO CÓDIGO ---
/**
 * 1. LIMPEZA PARA NUVEM: Removidos todos os console.log e mensagens de depuração para garantir segurança e performance em produção.
 * 2. FLUXO PRESERVADO: A lógica de captura de token, verificação de 'nivelAcesso' e redirecionamento para 'CLINICA' ou 'PAINEL' permanece intacta.
 * 3. SEGURANÇA: Mantivemos o tratamento de erros (catch) para que o usuário receba feedbacks visuais em caso de falha de conexão ou senha incorreta.
 * 4. UI MODERNA: O componente continua utilizando Tailwind CSS com as cores Slate e Blue, mantendo a estética dark/neon aprovada.
 */