import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Check, RefreshCw, Loader2, MessageCircle, MapPin } from 'lucide-react';
import axios from 'axios'; // Para o ViaCEP

const BASE_URL_LOGIN = "https://sistema-castracao-app.onrender.com/admin/login";

// --- SERVIÇO DE MENSAGENS (Mantido) ---
const messagesService = {
    gerarLinkWhatsApp: (dados, tipoAcao, mudouSenha = false) => {
        let texto = "";
        const saudacao = `Olá *${dados.nome}*! 🏥`;
        const rodape = `\n\n_Equipe Sistema Castração_`;
        const emailFinal = dados.administrador?.email || dados.email;
        const senhaFinal = dados.administrador?.senha || dados.senha;

        if (tipoAcao === 'CADASTRO_NOVO') {
            texto = `${saudacao}\n\nÉ uma honra ter sua clínica como parceira! Seu acesso ao painel foi liberado.\n\n📧 *LOGIN:* ${emailFinal}\n🔑 *SENHA:* ${senhaFinal}\n🔗 *ACESSO:* ${BASE_URL_LOGIN}${rodape}`;
        } else if (tipoAcao === 'ATUALIZACAO') {
            const infoSenha = mudouSenha ? `🔑 *NOVA SENHA:* ${senhaFinal}` : `🔑 *SENHA:* (Mantida a anterior)`;
            texto = `${saudacao}\n\nSeus dados de acesso foram atualizados.\n\n📧 *LOGIN:* ${emailFinal}\n${infoSenha}\n🌐 *LINK:* ${BASE_URL_LOGIN}${rodape}`;
        }
        if (!texto) return null;
        const foneLimpo = (dados.telefone || "").replace(/\D/g, '');
        return `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(texto)}`;
    }
};

const CadastroClinica = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- ESTADO INICIAL COM CAMPOS ESTRUTURADOS ---
    const estadoInicial = {
        nome: '',
        cnpj: '',
        crmvResponsavel: '',
        telefone: '',
        // Novos campos de endereço:
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: 'Tatuí',
        estado: 'SP',
        administrador: { email: '', senha: '' }
    };

    const [passo, setPasso] = useState(1);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemInfo, setMensagemInfo] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(estadoInicial);
    const [linkWhatsapp, setLinkWhatsapp] = useState(null);
    const [sucessoFinal, setSucessoFinal] = useState(false);

    // Máscaras
    const maskCNPJ = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").replace(/(-\d{2})\d+?$/, "$1");
    const maskTelefone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
    const maskCEP = (v) => v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");

    const gerarSenhaAleatoria = () => {
        const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let senha = '';
        for (let i = 0; i < 8; i++) senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        return senha;
    };

    // --- BUSCA CEP ---
    const handleCEPBlur = async () => {
        const cepLimpo = formData.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const res = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            if (!res.data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logradouro: res.data.logradouro,
                    bairro: res.data.bairro,
                    cidade: res.data.localidade,
                    estado: res.data.uf
                }));
                setErro("");
            } else {
                setErro("⚠️ CEP não encontrado.");
            }
        } catch (err) {
            setErro("❌ Erro ao buscar CEP.");
        }
    };

    useEffect(() => {
        if (location.state?.clinica) {
            const c = location.state.clinica;
            setIsEdit(true);
            setFormData({
                ...c,
                cnpj: maskCNPJ(c.cnpj),
                telefone: maskTelefone(c.telefone || ''),
                cep: maskCEP(c.cep || ''),
                crmvResponsavel: (c.crmvResponsavel || '').toUpperCase(),
                administrador: {
                    email: (c.administrador?.email || c.email || '').toLowerCase(),
                    senha: '' 
                }
            });
            setMensagemInfo("ℹ️ Editando dados da clínica.");
        } else {
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
        if (name === "cep") val = maskCEP(value);
        if (name === "crmvResponsavel") val = value.toUpperCase();
        
       // --- JEITO CERTO NO REACT ---
if (["nome", "logradouro", "bairro", "cidade"].includes(name)) {
    // Apenas garante que a primeira letra da frase seja maiúscula 
    // ou use uma lógica que não quebre com acentos
    val = value.charAt(0).toUpperCase() + value.slice(1);
}

        if (name === "email" || name === "senha") {
            const finalVal = name === "email" ? val.toLowerCase().trim() : val;
            setFormData({ ...formData, administrador: { ...formData.administrador, [name]: finalVal } });
        } else {
            setFormData({ ...formData, [name]: val });
        }
    };

    // --- VERIFICAÇÃO INTELIGENTE POR CNPJ ---
    const verificarCnpjESeguir = async () => {
        const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length < 14) return setErro("⚠️ Informe um CNPJ completo.");
        if (formData.nome.trim().length < 3) return setErro("⚠️ Informe o nome da clínica.");
        
        if (isEdit) return setPasso(2);
        
        setLoading(true); setErro("");
        try {
            const response = await api.get(`/admin/clinicas/verificar/${cnpjLimpo}`);
            if (response.data.existe) {
                const c = response.data.clinica;
                setIsEdit(true);
                setFormData({
                    ...c,
                    cnpj: maskCNPJ(c.cnpj),
                    telefone: maskTelefone(c.telefone || ''),
                    cep: maskCEP(c.cep || ''),
                    administrador: { email: (c.administrador?.email || '').toLowerCase(), senha: '' }
                });
                setMensagemInfo("ℹ️ Clínica encontrada! Modo de edição ativado.");
            }
            setPasso(2);
        } catch (err) { setErro("❌ Erro ao validar CNPJ."); } 
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!formData.administrador.email.includes('@')) return setErro("⚠️ E-mail inválido.");
        if (!formData.cep || !formData.logradouro) return setErro("⚠️ Preencha o endereço corretamente.");
        
        setLoading(true);
        try {
            const payload = {
                ...formData,
                cnpj: formData.cnpj.replace(/\D/g, ''),
                cep: formData.cep.replace(/\D/g, ''),
                administrador: { ...formData.administrador, nome: formData.nome }
            };

            await api.post('/admin/clinicas', payload);

            const link = messagesService.gerarLinkWhatsApp(
                formData,
                isEdit ? 'ATUALIZACAO' : 'CADASTRO_NOVO',
                formData.administrador.senha.length > 0
            );

            setLinkWhatsapp(link);
            setSucessoFinal(true);
        } catch (err) {
            setErro(`❌ ${err.response?.data?.message || "Falha ao salvar"}`);
        } finally { setLoading(false); }
    };

    const inputStyle = `w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`;

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-white">
            <button onClick={() => navigate('/admin/clinicas')} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft size={20}/> Lista de Clínicas
            </button>

            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                {sucessoFinal ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500">
                            <Check size={40} />
                        </div>
                        <h2 className="text-2xl font-black mb-2 italic uppercase">Sucesso!</h2>
                        <p className="text-slate-400 text-sm mb-8">Clínica registrada com sucesso.</p>

                        {linkWhatsapp && (
                            <a href={linkWhatsapp} target="_blank" rel="noreferrer" 
                               className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black transition-all no-underline shadow-lg shadow-emerald-900/20">
                                 <MessageCircle size={24} /> ENVIAR WHATSAPP
                            </a>
                        )}
                        <button onClick={() => navigate('/admin/clinicas')} className="mt-8 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest">Concluir</button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center mb-8 space-x-3">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold ${passo >= num ? 'bg-blue-600' : 'bg-slate-800 text-slate-500'}`}>{passo > num ? <Check size={18}/> : num}</div>
                                    {num < 3 && <div className={`w-6 h-1 ${passo > num ? 'bg-blue-600' : 'bg-slate-800'}`} />}
                                </div>
                            ))}
                        </div>

                        <h2 className="text-xl font-black uppercase mb-6 text-center italic text-blue-500">{isEdit ? "Editar Clínica" : "Nova Clínica"}</h2>

                        {erro && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl text-[10px] text-center font-bold uppercase">{erro}</div>}
                        {mensagemInfo && <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/50 text-blue-400 rounded-xl text-[10px] text-center font-bold uppercase">{mensagemInfo}</div>}

                        {passo === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <input className={inputStyle} name="cnpj" placeholder="CNPJ" onChange={handleChange} value={formData.cnpj} disabled={isEdit} />
                                <input className={inputStyle} name="nome" placeholder="Nome da Clínica" onChange={handleChange} value={formData.nome} />
                                <button onClick={verificarCnpjESeguir} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black uppercase flex justify-center items-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Próximo"}
                                </button>
                            </div>
                        )}

                        {passo === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <input className={inputStyle} name="crmvResponsavel" placeholder="CRMV Resp." onChange={handleChange} value={formData.crmvResponsavel} />
                                    <input className={inputStyle} name="telefone" placeholder="WhatsApp" onChange={handleChange} value={formData.telefone} />
                                </div>

                                {/* --- CAMPOS DE ENDEREÇO ESTRUTURADOS --- */}
                                <div className="relative">
                                    <input className={inputStyle} name="cep" placeholder="CEP" onChange={handleChange} onBlur={handleCEPBlur} value={formData.cep} />
                                    <MapPin className="absolute right-3 top-3 text-slate-500" size={18} />
                                </div>
                                <input className={inputStyle} name="logradouro" placeholder="Rua / Logradouro" onChange={handleChange} value={formData.logradouro} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className={inputStyle} name="numero" placeholder="Número" onChange={handleChange} value={formData.numero} />
                                    <input className={inputStyle} name="bairro" placeholder="Bairro" onChange={handleChange} value={formData.bairro} />
                                </div>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => setPasso(1)} className="w-1/2 bg-slate-800 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                                    <button onClick={() => setPasso(3)} className="w-1/2 bg-blue-600 p-4 rounded-xl font-bold uppercase text-xs">Próximo</button>
                                </div>
                            </div>
                        )}

                        {passo === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <input className={inputStyle} name="email" type="email" placeholder="E-mail de Acesso" onChange={handleChange} value={formData.administrador.email} />
                                <div className="relative">
                                    <input className={inputStyle} name="senha" value={formData.administrador.senha} onChange={handleChange} placeholder={isEdit ? "Nova Senha (Opcional)" : "Senha"} />
                                    <button type="button" onClick={() => setFormData({...formData, administrador: {...formData.administrador, senha: gerarSenhaAleatoria()}})} className="absolute right-3 top-3 text-blue-500"><RefreshCw size={18} /></button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setPasso(2)} className="w-1/2 bg-slate-800 p-4 rounded-xl font-bold uppercase text-xs">Voltar</button>
                                    <button onClick={handleSubmit} disabled={loading} className="w-1/2 bg-blue-600 p-4 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2">
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalizar"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CadastroClinica;