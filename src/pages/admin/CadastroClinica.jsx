import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importado useLocation
import api from '../../services/api';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';

const CadastroClinica = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para pegar dados da navegação
    
    const estadoInicial = {
        nome: '',
        cnpj: '',
        crmvResponsavel: '',
        telefone: '',
        endereco: '',
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

    // MÁSCARAS E FORMATAÇÃO
    const maskCNPJ = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
    const maskTelefone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    const formatUpper = (v) => v.toUpperCase();

    const gerarSenhaAleatoria = () => {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let senha = '';
        for (let i = 0; i < 8; i++) senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        return senha;
    };

    // EFEITO PARA CARREGAR DADOS NA EDIÇÃO
    useEffect(() => {
        // Se existir um estado vindo da navegação (clicou em editar na lista)
        if (location.state && location.state.clinica) {
            const c = location.state.clinica;
            setIsEdit(true);
            setFormData({
                ...c,
                cnpj: maskCNPJ(c.cnpj),
                telefone: maskTelefone(c.telefone || ''),
                crmvResponsavel: formatUpper(c.crmvResponsavel || ''),
                administrador: {
                    email: (c.administrador?.email || c.email || '').toLowerCase(),
                    senha: '' // Senha vazia por segurança na edição
                }
            });
            setMensagemInfo("ℹ️ Editando dados da clínica.");
        } 
        // Se for cadastro novo, gera a senha inicial
        else if (!isEdit && !formData.administrador.senha) {
            setFormData(prev => ({
                ...prev,
                administrador: { ...prev.administrador, senha: gerarSenhaAleatoria() }
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;

        if (name === "cnpj") val = maskCNPJ(value);
        if (name === "telefone") val = maskTelefone(value);
        if (name === "crmvResponsavel") val = formatUpper(value);
        
        if (name === "nome" || name === "endereco") {
            val = value.replace(/\b\w/g, (l) => l.toUpperCase());
        }

        if (name === "email" || name === "senha") {
            const finalVal = name === "email" ? val.toLowerCase().trim() : val;
            setFormData({ ...formData, administrador: { ...formData.administrador, [name]: finalVal } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    const validarPasso1 = () => {
        if (formData.cnpj.replace(/\D/g, '').length < 14) {
            setErro("⚠️ Informe um CNPJ completo.");
            return false;
        }
        if (formData.nome.trim().length < 3) {
            setErro("⚠️ Informe o nome da clínica.");
            return false;
        }
        return true;
    };

    const verificarCnpjESeguir = async () => {
        if (!validarPasso1()) return;
        
        // Se já estamos em modo edit (puxado pelo useEffect), apenas segue o passo
        if (isEdit) {
            setPasso(2);
            return;
        }

        setLoading(true);
        setErro("");

        try {
            const token = localStorage.getItem('token');
            const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
            const response = await api.get(`/admin/clinicas/verificar/${cnpjLimpo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.existe) {
                const c = response.data.clinica;
                setIsEdit(true);
                setFormData({
                    ...c,
                    cnpj: maskCNPJ(c.cnpj),
                    telefone: maskTelefone(c.telefone || ''),
                    crmvResponsavel: formatUpper(c.crmvResponsavel || ''),
                    administrador: {
                        email: (c.administrador?.email || c.email || '').toLowerCase(),
                        senha: '' 
                    }
                });
                setMensagemInfo("ℹ️ Clínica encontrada! Modo de edição ativado.");
            }
            setPasso(2);
        } catch (err) {
            setErro("❌ Erro ao validar CNPJ.");
        } finally {
            setLoading(false);
        }
    };

    const validarPasso2 = () => {
        if (!formData.crmvResponsavel.trim()) {
            setErro("⚠️ O CRMV é obrigatório.");
            return;
        }
        if (formData.telefone.replace(/\D/g, '').length < 10) {
            setErro("⚠️ Telefone inválido.");
            return;
        }
        if (!formData.endereco.includes('/') && !formData.endereco.includes('-')) {
            setErro("⚠️ Formato de endereço inválido. Use: Rua, Nº - Bairro, Cidade/UF");
            return;
        }
        setErro("");
        setPasso(3);
    };

    const handleSubmit = async () => {
        if (!formData.administrador.email.includes('@')) {
            setErro("⚠️ Informe um e-mail válido.");
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                cnpj: formData.cnpj.replace(/\D/g, ''),
                administrador: {
                    ...formData.administrador,
                    nome: formData.nome 
                }
            };

            await api.post('/admin/clinicas', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(isEdit ? "✅ Clínica atualizada!" : "✅ Clínica cadastrada!");
            navigate('/admin/clinicas');
        } catch (err) {
            setErro(`❌ Erro: ${err.response?.data?.message || "Falha ao salvar"}`);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${loading ? 'opacity-50' : ''}`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/clinicas')} className="mb-6 text-slate-400 hover:text-white flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2"/> Lista de Clínicas
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 relative shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                        <RefreshCw className="animate-spin text-blue-500" size={32} />
                    </div>
                )}

                <div className="flex items-center justify-center mb-8 space-x-4">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${passo >= num ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                {passo > num ? <Check size={18}/> : num}
                            </div>
                            {num < 3 && <div className={`w-8 h-1 ${passo > num ? 'bg-blue-600' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-black uppercase mb-6 text-center italic text-blue-500 tracking-tighter">
                    {isEdit ? "Editar Clínica" : "Nova Clínica"}
                </h2>

                {erro && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-[11px] text-center font-bold uppercase">{erro}</div>}
                {mensagemInfo && <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/50 text-blue-400 rounded-xl text-[11px] text-center font-bold uppercase">{mensagemInfo}</div>}

                {passo === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Documento Principal</label>
                            <input className={inputStyle} name="cnpj" placeholder="00.000.000/0000-00" onChange={handleChange} value={formData.cnpj} disabled={isEdit} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome da Instituição</label>
                            <input className={inputStyle} name="nome" placeholder="Ex: Clínica Veterinária Tatuí" onChange={handleChange} value={formData.nome} />
                        </div>
                        <button onClick={verificarCnpjESeguir} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black uppercase tracking-widest mt-2 transition-all shadow-lg shadow-blue-900/20">
                            {isEdit ? "Confirmar e Seguir" : "Validar e Seguir"}
                        </button>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Registro Profissional (CRMV)</label>
                            <input className={inputStyle} name="crmvResponsavel" placeholder="Ex: CRMV-RJ 12345" onChange={handleChange} value={formData.crmvResponsavel} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">WhatsApp / Contato</label>
                            <input className={inputStyle} name="telefone" placeholder="(00) 00000-0000" onChange={handleChange} value={formData.telefone} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Endereço (Padrão Histórico)</label>
                            <input className={inputStyle} name="endereco" placeholder="Rua, 123 - Bairro, Cidade/UF" onChange={handleChange} value={formData.endereco} />
                            <p className="text-[9px] text-slate-600 mt-1 ml-1 italic">Ex: Rua XI de Agosto, 50 - Centro, Tatuí/SP</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setPasso(1)} className="w-1/2 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold uppercase text-xs transition-colors">Voltar</button>
                            <button onClick={validarPasso2} className="w-1/2 bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold uppercase text-xs transition-colors">Próximo</button>
                        </div>
                    </div>
                )}

                {passo === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail de Acesso</label>
                            <input className={inputStyle} name="email" type="email" placeholder="email@exemplo.com" onChange={handleChange} value={formData.administrador.email} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{isEdit ? "Nova Senha (Opcional)" : "Senha de Acesso"}</label>
                            <div className="relative">
                                <input className={inputStyle} name="senha" value={formData.administrador.senha} onChange={handleChange} placeholder={isEdit ? "Deixe em branco para manter" : "Mínimo 4 caracteres"} />
                                <button type="button" onClick={() => setFormData({...formData, administrador: {...formData.administrador, senha: gerarSenhaAleatoria()}})} className="absolute right-3 top-3 text-blue-500 hover:text-blue-400 transition-colors">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setPasso(2)} className="w-1/2 bg-slate-800 hover:bg-slate-700 p-4 rounded-xl font-bold uppercase text-xs transition-colors">Voltar</button>
                            <button onClick={handleSubmit} className="w-1/2 bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black uppercase text-xs italic tracking-widest transition-all shadow-lg shadow-blue-900/20">Finalizar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CadastroClinica;