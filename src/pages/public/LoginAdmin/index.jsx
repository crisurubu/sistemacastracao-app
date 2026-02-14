import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const LoginAdmin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        const loginData = {
            email: email.trim(),
            senha: senha.trim()
        };

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                login(data.user, data.token);
                if (data.user.nivelAcesso === 'CLINICA') {
                    navigate('/admin/dashboard-clinica');
                } else {
                    navigate('/admin/painel');
                }
            } else {
                if (response.status === 401) {
                    setErro('E-mail ou senha incorretos.');
                } else {
                    setErro(data.erro || 'Erro ao realizar login.');
                }
            }
        } catch (err) {
            setErro('Erro de conexão com o servidor');
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
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-900/20"
                    >
                        ENTRAR NO SISTEMA
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;