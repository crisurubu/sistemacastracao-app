import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Key, Save, History, AlertTriangle, Landmark, DollarSign, Loader2 } from 'lucide-react';

const GestaoPix = () => {
    const [pixAtivo, setPixAtivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false); // NOVO ESTADO PARA O BOTÃO
    const [novaChave, setNovaChave] = useState({
        chave: '', 
        tipoChave: 'E-MAIL', 
        nomeRecebedor: 'Sistema Castracao ong', 
        documentoRecebedor: '', 
        banco: '',
        agencia: '',      // NOVO
        conta: '',        // NOVO
        valorTaxa: ''     // NOVO
    });

    const carregarPixAtivo = async () => {
        try {
            const res = await api.get('/admin/configuracao-pix/ativa');
            setPixAtivo(res.data);
        } catch (err) {
            console.error("Erro ao buscar PIX ativo", err);
        } finally {
            setLoading(false);
        }
    };

    const salvarNovaChave = async (e) => {
        e.preventDefault();
        
        if (!window.confirm("Atenção: Isso mudará o destino e o valor das doações. Confirmar?")) return;

        setSalvando(true); // ATIVA O LOADER

        try {
            await api.post('/admin/configuracao-pix/cadastrar', novaChave);
            alert("Configuração atualizada com sucesso!");
            carregarPixAtivo();
            // Limpa o formulário com os novos campos
            setNovaChave({ 
                chave: '', tipoChave: 'E-MAIL', nomeRecebedor: 'Sistema Castracao ong', 
                documentoRecebedor: '', banco: '', agencia: '', conta: '', valorTaxa: '' 
            });
        } catch (err) {
            alert("Erro ao salvar. Verifique se preencheu Agência e Conta corretamente.");
        } finally {
            setSalvando(false); // DESATIVA O LOADER
        }
    };

    useEffect(() => { carregarPixAtivo(); }, []);

    if (loading) return <div className="p-8 text-white">Carregando dados financeiros...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4 text-amber-500">
                <AlertTriangle size={24} />
                <p className="text-sm font-medium">
                    Área Crítica: Alterações aqui mudam o destino do dinheiro e o valor da taxa de castração.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chave Atual */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <History size={16} /> PIX Ativo no Momento
                    </h3>
                    {pixAtivo ? (
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-emerald-500/20">
                            <p className="text-emerald-400 font-mono text-xl font-bold break-all">{pixAtivo.chave}</p>
                            <div className="mt-2 text-slate-400 text-sm space-y-1">
                                <p><strong>Banco:</strong> {pixAtivo.banco}</p>
                                <p><strong>Agência:</strong> {pixAtivo.agencia} | <strong>Conta:</strong> {pixAtivo.conta}</p>
                                <p className="text-amber-400"><strong>Taxa Atual:</strong> R$ {pixAtivo.valorTaxa}</p>
                                <p><strong>Titular:</strong> {pixAtivo.nomeRecebedor}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-400">Nenhuma chave ativa!</p>
                    )}
                </div>

                {/* Formulário de Troca */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                        <Key size={20} className="text-blue-500" /> Configurar Nova Conta
                    </h3>
                    
                    <form onSubmit={salvarNovaChave} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <select 
                                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                value={novaChave.tipoChave}
                                onChange={e => setNovaChave({...novaChave, tipoChave: e.target.value})}
                            >
                                <option value="E-MAIL">E-mail</option>
                                <option value="CPF">CPF</option>
                                <option value="CNPJ">CNPJ</option>
                                <option value="CELULAR">Celular</option>
                                <option value="ALEATORIA">Chave Aleatória</option>
                            </select>

                            <input 
                                type="number"
                                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                placeholder="Valor Taxa (Ex: 25.00)"
                                required
                                value={novaChave.valorTaxa}
                                onChange={e => setNovaChave({...novaChave, valorTaxa: e.target.value})}
                            />
                        </div>

                        <input 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                            placeholder="Chave PIX"
                            required
                            value={novaChave.chave}
                            onChange={e => setNovaChave({...novaChave, chave: e.target.value})}
                        />

                        <input 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                            placeholder="Nome do Recebedor (Titular)"
                            required
                            value={novaChave.nomeRecebedor}
                            onChange={e => setNovaChave({...novaChave, nomeRecebedor: e.target.value})}
                        />

                        <div className="grid grid-cols-3 gap-2">
                            <input 
                                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                placeholder="Banco"
                                required
                                value={novaChave.banco}
                                onChange={e => setNovaChave({...novaChave, banco: e.target.value})}
                            />
                            <input 
                                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                placeholder="Agência"
                                required
                                value={novaChave.agencia}
                                onChange={e => setNovaChave({...novaChave, agencia: e.target.value})}
                            />
                            <input 
                                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                placeholder="Conta"
                                required
                                value={novaChave.conta}
                                onChange={e => setNovaChave({...novaChave, conta: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={salvando}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {salvando ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Ativar Nova Configuração
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GestaoPix;