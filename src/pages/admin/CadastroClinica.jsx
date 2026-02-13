import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CadastroClinica = () => {
    const navigate = useNavigate();
    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        telefone: '',
        endereco: '',
        crmvResponsavel: '',
        email: '',
        senha: ''
    });

    // --- MÁSCARAS ---
    const maskCNPJ = (value) => {
        return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
    };

    const maskTelefone = (value) => {
        return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let maskedValue = value;
        if (name === "cnpj") maskedValue = maskCNPJ(value);
        if (name === "telefone") maskedValue = maskTelefone(value);
        setFormData({ ...formData, [name]: maskedValue });
    };

    const validarCnpjERelancar = async () => {
        const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length < 14 || !formData.nome) {
            setErro("Nome e CNPJ completo são obrigatórios.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/admin/clinicas/verificar/${cnpjLimpo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.existe) {
                setErro("Este CNPJ já está cadastrado.");
            } else {
                setErro("");
                setPasso(2);
            }
        } catch (err) {
            setErro("Erro ao validar CNPJ.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true); // Ativa o estado de carregamento e trava a tela
        setErro(""); 
        try {
            const token = localStorage.getItem('token');
            const payload = {
                nome: formData.nome,
                cnpj: formData.cnpj.replace(/\D/g, ''),
                telefone: formData.telefone,
                endereco: formData.endereco,
                crmvResponsavel: formData.crmvResponsavel,
                administrador: {
                    nome: formData.nome,
                    email: formData.email,
                    senha: formData.senha
                }
            };

            await axios.post('http://localhost:8080/api/admin/clinicas', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redireciona após o sucesso
            navigate('/admin/clinicas'); 
        } catch (err) {
            setErro("Erro ao salvar clínica. Verifique se o e-mail já existe.");
            setLoading(false); // Só libera se der erro, para o usuário corrigir
        }
        // Nota: o setLoading(false) não vai no finally aqui para evitar que os botões 
        // pisquem antes do navigate acontecer.
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen"> 
            <button 
                onClick={() => navigate(-1)} 
                disabled={loading}
                className={`mb-6 text-slate-400 hover:text-white flex items-center transition-colors ${loading ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
                <span className="mr-2">←</span> Voltar para a lista
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
                {/* Overlay de carregamento sutil se quiser algo mais visual */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                            <span className="text-blue-400 text-xs font-bold animate-pulse">PROCESSANDO...</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center mb-8 space-x-4">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${passo === num ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                {num}
                            </div>
                            {num < 3 && <div className={`w-8 h-1 ${passo > num ? 'bg-blue-600' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                <h1 className="text-2xl font-bold mb-8 text-center text-white">
                    {passo === 1 && "Dados da Clínica"}
                    {passo === 2 && "Informações de Contato"}
                    {passo === 3 && "Configuração de Acesso"}
                </h1>

                {erro && <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg text-sm text-center font-medium">{erro}</div>}

                {/* PASSO 1 */}
                {passo === 1 && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Nome Fantasia</label>
                            <input disabled={loading} className={inputStyle} name="nome" placeholder="Ex: Clínica Veterinária Amigo" onChange={handleChange} value={formData.nome} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">CNPJ</label>
                            <input disabled={loading} className={inputStyle} name="cnpj" placeholder="00.000.000/0000-00" onChange={handleChange} value={formData.cnpj} />
                        </div>
                        <button onClick={validarCnpjERelancar} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50">
                            {loading ? "Verificando..." : "Continuar"}
                        </button>
                    </div>
                )}

                {/* PASSO 2 */}
                {passo === 2 && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Telefone / WhatsApp</label>
                            <input disabled={loading} className={inputStyle} name="telefone" placeholder="(00) 00000-0000" onChange={handleChange} value={formData.telefone} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Endereço Completo</label>
                            <input disabled={loading} className={inputStyle} name="endereco" placeholder="Rua, Número, Bairro, Cidade" onChange={handleChange} value={formData.endereco} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">CRMV do Veterinário Responsável</label>
                            <input disabled={loading} className={inputStyle} name="crmvResponsavel" placeholder="CRMV-XX 0000" onChange={handleChange} value={formData.crmvResponsavel} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setPasso(1)} disabled={loading} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 p-4 rounded-xl disabled:opacity-30">Anterior</button>
                            <button onClick={() => setPasso(3)} disabled={loading} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold">Continuar</button>
                        </div>
                    </div>
                )}

                {/* PASSO 3 */}
                {passo === 3 && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">E-mail de Login da Clínica</label>
                            <input disabled={loading} className={inputStyle} name="email" type="email" placeholder="clinica@gmail.com" onChange={handleChange} value={formData.email} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Senha de Acesso</label>
                            <input disabled={loading} className={inputStyle} name="senha" type="password" placeholder="••••••••" onChange={handleChange} value={formData.senha} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setPasso(2)} disabled={loading} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 p-4 rounded-xl disabled:opacity-30">Anterior</button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading} 
                                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Salvando...
                                    </>
                                ) : "Finalizar"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CadastroClinica;