import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { maskCPF, maskPhone } from '../../utils/masks';

const CadastroTutor = () => {
    const [etapa, setEtapa] = useState(1);
    const [loadingCpf, setLoadingCpf] = useState(false);
    const [cpfVerificado, setCpfVerificado] = useState(false);
    const [isEnviando, setIsEnviando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState(null);
    const [verificandoEmail, setVerificandoEmail] = useState(false);

    const [pixAtivo, setPixAtivo] = useState({
        chave: 'Carregando...',
        nomeRecebedor: 'Carregando...',
        tipoChave: '',
        valorTaxa: 0.00,
        banco: '',
        agencia: '',
        conta: ''
    });

    const [dados, setDados] = useState({
        nomeTutor: '',
        cpf: '',
        email: '',
        whatsapp: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: 'Tatuí',
        nomePet: '',
        especie: 'CACHORRO',
        sexo: 'MACHO',
        idadeAprox: '',
        vacinado: true,
        operouAntes: false,
        medicamentos: ''
    });

    const [arquivo, setArquivo] = useState(null);

    useEffect(() => {
        const carregarPixAtivo = async () => {
            try {
                const response = await api.get('/admin/configuracao-pix/ativa');
                if (response.data) setPixAtivo(response.data);
            } catch (error) {
                console.error("Erro ao buscar dados bancários:", error);
            }
        };
        carregarPixAtivo();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let valorFinal = type === 'checkbox' ? checked : value;

        if (name === 'cpf') {
            valorFinal = maskCPF(value);
            setCpfVerificado(false);
        }

        if (name === 'whatsapp') {
            valorFinal = maskPhone(value);
        }

        setDados(prev => ({ ...prev, [name]: valorFinal }));
    };

    const emailValido = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const verificarCpfExistente = async () => {
        const cpfLimpo = dados.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) return setMensagemErro("⚠️ Digite o CPF completo.");

        setLoadingCpf(true);
        try {
            const response = await api.get(`/tutores/consultar/${cpfLimpo}`);
            setDados(prev => ({
                ...prev,
                nomeTutor: response.data.nome || '',
                email: response.data.email || '',
                whatsapp: response.data.whatsapp || response.data.telefone || '',
                logradouro: response.data.logradouro || '',
                numero: response.data.numero || '',
                bairro: response.data.bairro || '',
                cidade: response.data.cidade || 'Tatuí',
            }));
            setCpfVerificado(true);
        } catch (error) {
            if (error.response?.status === 404) setCpfVerificado(true);
            else setMensagemErro("❌ Erro ao conectar com o servidor.");
        } finally {
            setLoadingCpf(false);
        }
    };

    const handleAvancarEtapa3 = async () => {
        // Validação rigorosa: não deixa passar se algum campo estiver vazio
        if (!dados.nomeTutor || !dados.whatsapp || !dados.email || !dados.logradouro || !dados.numero || !dados.bairro || !dados.cidade) {
            setMensagemErro("⚠️ Por favor, preencha todos os campos do endereço, incluindo bairro e cidade.");
            return;
        }

        if (!emailValido(dados.email)) {
            setMensagemErro("⚠️ O e-mail informado é inválido.");
            return;
        }

        setVerificandoEmail(true);
        try {
            const response = await api.get(`/tutores/verificar-email?email=${dados.email}`);
            const { exists, cpfOwner } = response.data;
            const cpfAtualLimpo = dados.cpf.replace(/\D/g, '');
            const cpfOwnerLimpo = cpfOwner ? cpfOwner.replace(/\D/g, '') : null;

            if (exists && cpfOwnerLimpo !== cpfAtualLimpo) {
                setMensagemErro("❌ Este e-mail já pertence a outro tutor.");
            } else {
                setEtapa(4);
            }
        } catch (error) {
            setEtapa(4);
        } finally {
            setVerificandoEmail(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!arquivo) return setMensagemErro("⚠️ Por favor, anexe o comprovante do PIX.");

        setIsEnviando(true);
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));

        try {
            await api.post('/cadastros', formData);
            setEtapa(6);
        } catch (error) {
            const erroReal = error.response?.data?.message || "Erro no servidor";
            setMensagemErro(`❌ Falha no envio: ${erroReal}`);
        } finally {
            setIsEnviando(false);
        }
    };

    const progress = (etapa / 5) * 100;

    return (
        <div className="min-h-screen bg-ong-dark flex items-center justify-center p-4">
            
            {mensagemErro && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
                    <div className="bg-ong-card border border-red-500/30 p-8 rounded-[24px] max-w-sm w-full text-center shadow-2xl">
                        <div className="text-4xl mb-4 text-red-500">⚠️</div>
                        <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Atenção</h3>
                        <p className="text-slate-400 text-sm mb-6">{mensagemErro}</p>
                        <button onClick={() => setMensagemErro(null)} className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 text-red-500 font-bold rounded-xl transition-all uppercase text-xs">
                            Corrigir
                        </button>
                    </div>
                </div>
            )}

            {isEnviando && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ong-dark/90 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-ong-green border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-ong-green font-bold mt-4 tracking-widest uppercase text-sm">Processando Solicitação...</h2>
                </div>
            )}

            <div className="w-full max-w-4xl bg-ong-card border border-ong-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                
                <div className="md:w-1/3 bg-gradient-to-br from-ong-blue to-blue-900 p-8 text-white flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase leading-none mb-4">Sistema de <br />Castração</h1>
                        <p className="text-blue-100 text-sm font-medium opacity-80">Acessível a todos. <br /> Saúde e responsabilidade para o seu pet.</p>
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-widest">
                            <span>{etapa < 6 ? `Fase ${etapa} de 5` : 'Concluído'}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-ong-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 md:p-12 min-h-[500px] flex flex-col justify-center">

                    {etapa === 1 && (
                        <div className="space-y-6 animate-fade">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Seja bem-vindo(a)</h2>
                            <p className="text-slate-400">Inicie o agendamento para a castração social em Tatuí.</p>
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-ong-border text-center">
                                <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-widest">Valor da Taxa Social</span>
                                <span className="text-3xl font-black text-ong-green">R$ {pixAtivo.valorTaxa.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <Button onClick={() => setEtapa(2)} variant="blue" disabled={pixAtivo.valorTaxa === 0}>Iniciar Solicitação</Button>
                        </div>
                    )}

                    {etapa === 2 && (
                        <div className="space-y-6 animate-fade">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Identificação</h2>
                            <Input label="CPF do Tutor" name="cpf" value={dados.cpf} onChange={handleChange} placeholder="000.000.000-00" />
                            {!cpfVerificado ? (
                                <Button onClick={verificarCpfExistente} disabled={loadingCpf || dados.cpf.length !== 14} variant="blue">
                                    {loadingCpf ? 'Consultando...' : 'Consultar CPF'}
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-slate-800 border border-ong-blue/30 p-4 rounded-2xl text-center">
                                        <p className="text-ong-blue text-xs font-bold uppercase">
                                            {dados.nomeTutor ? `👋 Olá, ${dados.nomeTutor.split(' ')[0]}!` : '✨ Novo Cadastro'}
                                        </p>
                                    </div>
                                    <Button onClick={() => setEtapa(3)} variant="green">Prosseguir</Button>
                                    <button onClick={() => setCpfVerificado(false)} className="w-full text-[10px] text-slate-500 font-bold uppercase">Corrigir CPF</button>
                                </div>
                            )}
                        </div>
                    )}

                    {etapa === 3 && (
                        <div className="space-y-4 animate-fade">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Dados do Tutor</h2>
                            <Input label="Nome Completo" name="nomeTutor" value={dados.nomeTutor} onChange={handleChange} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="WhatsApp" name="whatsapp" value={dados.whatsapp} onChange={handleChange} />
                                <Input label="E-mail" name="email" type="email" value={dados.email} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3"><Input label="Endereço" name="logradouro" value={dados.logradouro} onChange={handleChange} /></div>
                                <div className="md:col-span-1"><Input label="Nº" name="numero" value={dados.numero} onChange={handleChange} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Bairro" name="bairro" value={dados.bairro} onChange={handleChange} />
                                <Input label="Cidade" name="cidade" value={dados.cidade} onChange={handleChange} />
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setEtapa(2)} className="flex-1 text-slate-400 font-bold py-4 rounded-2xl border border-slate-700">Voltar</button>
                                <Button onClick={handleAvancarEtapa3} variant="blue" disabled={verificandoEmail}>
                                    {verificandoEmail ? 'Validando...' : 'Dados do Pet'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {etapa === 4 && (
                        <div className="space-y-4 animate-fade">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-ong-blue">Sobre o Pet</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Nome do Animal" name="nomePet" value={dados.nomePet} onChange={handleChange} />
                                <Input label="Idade Aprox." name="idadeAprox" value={dados.idadeAprox} onChange={handleChange} placeholder="Ex: 2 anos" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] uppercase font-black text-slate-200 ml-1">Espécie</label>
                                    <select name="especie" onChange={handleChange} value={dados.especie} className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none">
                                        <option value="CACHORRO">Cachorro</option>
                                        <option value="GATO">Gato</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] uppercase font-black text-slate-200 ml-1">Sexo</label>
                                    <select name="sexo" onChange={handleChange} value={dados.sexo} className="w-full bg-[#1e293b]/50 border border-slate-700 p-4 rounded-2xl text-white outline-none">
                                        <option value="MACHO">Macho</option>
                                        <option value="FEMEA">Fêmea</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" name="vacinado" checked={dados.vacinado} onChange={handleChange} className="w-5 h-5 rounded border-slate-700 text-ong-blue focus:ring-ong-blue bg-slate-900" />
                                    <span className="text-xs font-bold text-slate-300 uppercase">Vacinado?</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" name="operouAntes" checked={dados.operouAntes} onChange={handleChange} className="w-5 h-5 rounded border-slate-700 text-ong-blue focus:ring-ong-blue bg-slate-900" />
                                    <span className="text-xs font-bold text-slate-300 uppercase">Já operou?</span>
                                </label>
                            </div>

                            <textarea name="medicamentos" value={dados.medicamentos} onChange={handleChange} placeholder="Medicamentos, alergias ou observações..." className="w-full bg-slate-900/50 border border-slate-700 p-4 rounded-2xl text-white outline-none text-sm min-h-[80px]" />
                            
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setEtapa(3)} className="flex-1 text-slate-400 font-bold py-4 rounded-2xl border border-slate-700">Voltar</button>
                                <Button onClick={() => {
                                    if(!dados.nomePet || !dados.idadeAprox) {
                                        setMensagemErro("⚠️ Informe o nome e a idade aproximada do pet.");
                                    } else {
                                        setEtapa(5);
                                    }
                                }} variant="blue">Pagamento</Button>
                            </div>
                        </div>
                    )}

                    {etapa === 5 && (
                        <div className="space-y-6 animate-fade">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Contribuição Social</h2>
                            <div className="bg-slate-800/80 border border-ong-blue/30 rounded-2xl overflow-hidden p-6 space-y-4">
                                <div className="text-center pb-4 border-b border-slate-700/50">
                                    <p className="text-xs text-slate-400 uppercase mb-1">Chave PIX ({pixAtivo.tipoChave})</p>
                                    <p className="text-xl font-mono font-bold text-white break-all">{pixAtivo.chave}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Banco</p>
                                        <p className="text-slate-200">{pixAtivo.banco || 'Não informado'}</p>
                                    </div>
                                    <div><p className="text-[10px] text-slate-500 uppercase font-bold">Agência</p><p className="text-slate-200">{pixAtivo.agencia || '---'}</p></div>
                                    <div><p className="text-[10px] text-slate-500 uppercase font-bold">Conta</p><p className="text-slate-200">{pixAtivo.conta || '---'}</p></div>
                                    <div className="col-span-2"><p className="text-[10px] text-slate-500 uppercase font-bold">Favorecido</p><p className="text-slate-200">{pixAtivo.nomeRecebedor}</p></div>
                                </div>
                                <div className="bg-ong-green/10 p-3 rounded-xl text-center text-ong-green font-bold">
                                    Valor: R$ {pixAtivo.valorTaxa.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Anexar Comprovante</label>
                                <input type="file" accept="image/*,.pdf" onChange={(e) => setArquivo(e.target.files[0])} className="w-full text-slate-400 text-sm file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-ong-blue file:text-white cursor-pointer" />
                            </div>
                            <Button onClick={handleSubmit} variant="green">Finalizar Agendamento</Button>
                            <button onClick={() => setEtapa(4)} className="w-full text-slate-500 text-xs font-bold uppercase">Revisar pet</button>
                        </div>
                    )}

                    {etapa === 6 && (
                        <div className="text-center space-y-6 py-10 animate-fade">
                            <div className="text-6xl animate-bounce">🐾</div>
                            <h2 className="text-3xl font-black text-ong-green uppercase italic">Solicitação Enviada!</h2>
                            <p className="text-slate-400 max-w-xs mx-auto">Recebemos o cadastro de <strong>{dados.nomePet}</strong>.</p>
                            <Button onClick={() => window.location.reload()} variant="blue">Novo Cadastro</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CadastroTutor;

/**
 * RESUMO DO CÓDIGO:
 * - Campo de Cidade: Adicionado visualmente na Etapa 3 e incluído na lógica de validação.
 * - Restauração de Campos do Pet: Mantidos os campos de Nome, Idade, Espécie, Sexo, Vacina e Cirurgia Prévia.
 * - Validação Completa: Nenhuma etapa avança se houver campos obrigatórios vazios (Tutor, Endereço e Pet).
 * - Dados Bancários: Exibição completa de Banco, Agência e Conta na etapa de pagamento.
 */