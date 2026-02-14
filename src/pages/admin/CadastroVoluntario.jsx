import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Check, Lock, RefreshCw } from 'lucide-react';

const CadastroVoluntario = () => {
    const navigate = useNavigate();
    
    // Estado inicial extraído para facilitar o reset
    const estadoInicial = {
        nome: '',
        cpf: '',
        whatsapp: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        administrador: {
            email: '',
            senha: ''
        }
    };

    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemInfo, setMensagemInfo] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(estadoInicial);

    const gerarSenhaAleatoria = () => {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let senha = '';
        for (let i = 0; i < 8; i++) senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        return senha;
    };

    // Função para resetar tudo
    const resetarFormulario = () => {
        setFormData({
            ...estadoInicial,
            administrador: { ...estadoInicial.administrador, senha: gerarSenhaAleatoria() }
        });
        setPasso(1);
        setIsEdit(false);
        setErro('');
        setMensagemInfo('');
    };

    useEffect(() => {
        if (!isEdit && !formData.administrador.senha) {
            setFormData(prev => ({
                ...prev,
                administrador: { ...prev.administrador, senha: gerarSenhaAleatoria() }
            }));
        }
    }, [isEdit]);

    const maskCPF = (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    const maskWhatsApp = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    const maskCEP = (v) => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === "cpf") val = maskCPF(value);
        if (name === "whatsapp") val = maskWhatsApp(value);
        if (name === "cep") val = maskCEP(value);

        if (name === "email") {
            setFormData({ ...formData, administrador: { ...formData.administrador, [name]: val } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const validarCpfESeguir = async () => {
        const cpfLimpo = formData.cpf.replace(/\D/g, '');
        if (cpfLimpo.length < 11) {
            setErro("⚠️ Informe um CPF válido para consultar.");
            return;
        }

        setLoading(true);
        setErro("");

        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/admin/voluntarios/verificar/${cpfLimpo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.existe) {
                const v = response.data.voluntario;
                setIsEdit(true);
                setFormData({
                    ...v,
                    cpf: maskCPF(v.cpf),
                    whatsapp: maskWhatsApp(v.whatsapp || ''),
                    cep: maskCEP(v.cep || ''),
                    administrador: {
                        ...v.administrador,
                        senha: '' 
                    }
                });
                setMensagemInfo("ℹ️ Voluntário encontrado! Você pode editar os dados abaixo.");
                setTimeout(() => setMensagemInfo(""), 5000);
            } else {
                setIsEdit(false);
                if (!formData.nome) {
                    setErro("⚠️ CPF disponível! Agora preencha o nome para continuar.");
                } else {
                    setPasso(2);
                }
            }
        } catch (err) {
            setErro("❌ Erro ao validar CPF no servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErro("");
        const token = localStorage.getItem('token');
        
        try {
            const payload = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                administrador: {
                    ...formData.administrador,
                    nome: formData.nome,
                    nivelAcesso: "VOLUNTARIO"
                }
            };

            await api.post('/admin/voluntarios', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(isEdit ? "✅ Dados atualizados com sucesso!" : "✅ Voluntário cadastrado com sucesso!");
            
            // RESETAR ANTES DE SAIR
            resetarFormulario();
            navigate('/admin/voluntarios');
            
        } catch (err) {
            setErro(`❌ Erro: ${err.response?.data?.message || "Falha ao salvar"}`);
        } finally {
            setLoading(false);
        }
    };

    const buscarCep = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf
                    }));
                }
            } catch (err) { }
        }
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/voluntarios')} className="mb-6 text-slate-400 hover:text-white flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2"/> Voltar para a lista
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                            <span className="text-emerald-400 font-bold animate-pulse uppercase tracking-tighter text-xs">Sincronizando...</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center mb-8 space-x-4">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${passo === num ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                                {passo > num ? <Check size={18}/> : num}
                            </div>
                            {num < 3 && <div className={`w-8 h-1 ${passo > num ? 'bg-emerald-600' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-center italic text-emerald-500">
                    {isEdit ? "Editar Voluntário" : (passo === 1 ? "Dados Pessoais" : passo === 2 ? "Endereço" : "Acesso")}
                </h2>

                {erro && <div className="mb-6 p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-xs text-center font-bold">{erro}</div>}
                {mensagemInfo && <div className="mb-6 p-3 bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-xs text-center font-bold">{mensagemInfo}</div>}

                {passo === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF (Consultar)</label>
                            <div className="flex gap-2">
                                <input className={inputStyle} name="cpf" placeholder="000.000.000-00" onChange={handleChange} value={formData.cpf} disabled={loading || isEdit} />
                                {!isEdit && (
                                    <button onClick={validarCpfESeguir} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-xl transition-colors">
                                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                            <input className={inputStyle} name="nome" placeholder="Nome" onChange={handleChange} value={formData.nome} disabled={loading} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp</label>
                            <input className={inputStyle} name="whatsapp" placeholder="(00) 00000-0000" onChange={handleChange} value={formData.whatsapp} disabled={loading} />
                        </div>
                        
                        <button 
                            onClick={() => {
                                if(!isEdit) { validarCpfESeguir(); } 
                                else { setPasso(2); }
                            }} 
                            disabled={loading} 
                            className="w-full bg-emerald-600 hover:bg-emerald-500 p-4 rounded-xl font-black uppercase tracking-widest transition-all mt-4 text-sm shadow-lg shadow-emerald-900/40"
                        >
                            {isEdit ? "Próximo: Endereço" : "Validar e Continuar"}
                        </button>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">CEP</label>
                                <input className={inputStyle} name="cep" placeholder="00000-000" onChange={handleChange} onBlur={buscarCep} value={formData.cep} disabled={loading} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número</label>
                                <input className={inputStyle} name="numero" placeholder="123" onChange={handleChange} value={formData.numero} disabled={loading} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Logradouro</label>
                            <input className={inputStyle} name="logradouro" placeholder="Rua..." onChange={handleChange} value={formData.logradouro} disabled={loading} />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setPasso(1)} disabled={loading} className="w-1/2 bg-slate-800 text-slate-400 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                            <button onClick={() => setPasso(3)} disabled={loading} className="w-1/2 bg-emerald-600 text-white p-4 rounded-xl font-bold uppercase text-xs">Próximo</button>
                        </div>
                    </div>
                )}

                {passo === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail de Login</label>
                            <input className={inputStyle} name="email" type="email" placeholder="email@gmail.com" onChange={handleChange} value={formData.administrador.email} disabled={loading} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                                {isEdit ? "Alterar Senha (opcional)" : "Senha Provisória"}
                            </label>
                            <div className="relative">
                                <input 
                                    className={`${inputStyle} pr-10 ${isEdit ? 'border-dashed border-emerald-500/30' : ''}`} 
                                    value={formData.administrador.senha} 
                                    onChange={(e) => setFormData({...formData, administrador: {...formData.administrador, senha: e.target.value}})}
                                    placeholder={isEdit ? "Deixe em branco para manter" : ""}
                                    readOnly={!isEdit && formData.administrador.senha.length > 0} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, administrador: {...formData.administrador, senha: gerarSenhaAleatoria()}})}
                                    className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-400 transition-colors"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setPasso(2)} disabled={loading} className="w-1/2 bg-slate-800 text-slate-400 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                            <button onClick={handleSubmit} disabled={loading} className="w-1/2 bg-emerald-600 text-white p-4 rounded-xl font-black uppercase text-xs italic tracking-widest shadow-lg shadow-emerald-900/40">Finalizar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CadastroVoluntario;