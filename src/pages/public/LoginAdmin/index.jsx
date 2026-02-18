import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
// IMPORTANTE: Importar a instância da API que criamos
import api from '../../../services/api'; 
import { Eye, EyeOff } from 'lucide-react';

const LoginAdmin = () => {
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
            // MUDANÇA: Usando api.post em vez de fetch com URL fixa
            // O caminho agora é apenas '/auth/login', a base vem do api.js
            const response = await api.post('/auth/login', loginData);

            // No Axios, os dados vêm direto no .data
            const data = response.data;

            login(data.user, data.token);
            
            if (data.user.nivelAcesso === 'CLINICA') {
                navigate('/admin/dashboard-clinica');
            } else {
                navigate('/admin/painel');
            }
       } catch (err) {
            setLoading(false);
            
            if (err.response) {
                // Pega a mensagem vinda do AutenticacaoService.java
                const mensagemServidor = err.response.data.message || err.response.data;

                // Verifica se a mensagem contém o texto de conta inativa/bloqueada
                if (mensagemServidor.includes("inativa") || mensagemServidor.includes("contate a administração")) {
                    setErro("🚫 Sua conta está bloqueada. Por favor, entre em contato com o administrador.");
                } else if (err.response.status === 401 || mensagemServidor.includes("incorretos")) {
                    setErro("❌ E-mail ou senha incorretos.");
                } else {
                    setErro(mensagemServidor || 'Erro ao realizar login.');
                }
            } else {
                setErro('🌐 Erro de conexão com o servidor (Local/Nuvem).');
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white">Sistema Castração</h2>
                    <p className="mt-2 text-blue-400 font-medium uppercase text-xs tracking-widest">Área Administrativa</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {erro && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/50">
                            {erro}
                        </div>
                    )}

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-semibold text-slate-300">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="sistemacastracao@gmail.com"
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-semibold text-slate-300">Senha</label>
                        <div className="relative">
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                tabIndex="-1"
                            >
                                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-lg py-3 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
                            loading 
                            ? 'bg-blue-800 cursor-not-allowed opacity-80' 
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-900/20'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                AUTENTICANDO...
                            </>
                        ) : (
                            'ENTRAR NO SISTEMA'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;