import React, { useState } from 'react';
import api from '../../../services/api';
import './style.css';

import NavbarPublica from '../../../components/NavbarPublica';
import Footer from '../../../components/Footer';

const CadastroTutor = () => {
    const [etapa, setEtapa] = useState(1);
    const [tutorJaCadastrado, setTutorJaCadastrado] = useState(false);
    const [loadingCpf, setLoadingCpf] = useState(false);
    const [cpfVerificado, setCpfVerificado] = useState(false);
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

    const aplicarMascaraCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const aplicarMascaraWhatsApp = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const verificarCpfExistente = async () => {
        const cpfLimpo = dados.cpf.replace(/\D/g, ''); 
        if (cpfLimpo.length !== 11) {
            alert("⚠️ Digite o CPF completo.");
            return;
        }

        setLoadingCpf(true);
        setCpfVerificado(false);

        try {
            // Ajustado para a rota correta de consulta
            const response = await api.get(`/tutores/consultar/${cpfLimpo}`);
            setTutorJaCadastrado(true);
            setDados(prev => ({
                ...prev,
                nomeTutor: response.data.nome || '',
                email: response.data.email || '',
                whatsapp: response.data.whatsapp || response.data.telefone || '',
                logradouro: response.data.logradouro || '',
                numero: response.data.numero || '',
                bairro: response.data.bairro || '',
                cidade: 'Tatuí'
            }));
            setCpfVerificado(true);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setTutorJaCadastrado(false);
                setCpfVerificado(true);
            } else {
                alert("❌ Erro ao conectar com o servidor.");
            }
        } finally {
            setLoadingCpf(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let valorFinal = type === 'checkbox' ? checked : value;

        if (name === 'cpf') {
            valorFinal = aplicarMascaraCPF(value);
            setCpfVerificado(false); 
        }
        if (name === 'whatsapp') valorFinal = aplicarMascaraWhatsApp(value);

        setDados({ ...dados, [name]: valorFinal });
    };

    const nextStep = () => {
        if (etapa === 3 && (!dados.nomeTutor || !dados.whatsapp || !dados.logradouro)) {
            alert("⚠️ Preencha os dados obrigatórios do tutor.");
            return;
        }
        setEtapa(etapa + 1);
    };

    const prevStep = () => setEtapa(etapa - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!arquivo) { 
            alert("⚠️ Por favor, anexe o comprovante do PIX."); 
            return; 
        }

        const formData = new FormData();
        formData.append('arquivo', arquivo);

        // O segredo para o Spring Boot não dar 415 ou 403: Blob com type application/json
        const jsonDados = JSON.stringify(dados);
        formData.append('dados', new Blob([jsonDados], { type: 'application/json' }));

        try {
            // MUDANÇA CRUCIAL: Adicionado o "S" em /cadastros para bater com o SecurityConfig
            await api.post('/cadastros', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('✨ Inscrição enviada com sucesso! Aguarde o contato da ONG.');
            window.location.reload();

        } catch (error) {
            console.error("Erro no processo:", error);
            // Se o erro persistir em 403, verifique o HttpMethod.POST no SecurityConfig
            alert('❌ Erro de permissão ou conexão (403). Verifique se o POST está liberado no backend.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavbarPublica />
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <div className="cadastro-container">
                    <div className="cadastro-card">
                        
                        <div className="info-side">
                            <h1 translate="no" style={{ fontWeight: 900, fontSize: '2.2rem', lineHeight: '1.1', marginBottom: '1rem' }}>Mutirão de Castração</h1>
                            <p style={{ opacity: 0.9, fontSize: '1rem', marginBottom: '2rem' }}>Protegendo os animais de Tatuí através do controle populacional.</p>
                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px' }}>PASSO {etapa} DE 5</div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '10px' }}>
                                    <div style={{ backgroundColor: '#fff', width: `${(etapa / 5) * 100}%`, height: '100%', borderRadius: '10px', transition: '0.5s' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="form-side">
                            {etapa === 1 && (
                                <div className="animate-fade">
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '15px' }}>Seja bem-vindo(a)!</h2>
                                    <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '10px' }}>O mutirão oferece castração a preço social para garantir a saúde do seu pet.</p>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>Custo por animal: R$ 20,00</p>
                                        <small style={{ color: '#94a3b8' }}>Este valor ajuda nos custos de materiais cirúrgicos.</small>
                                    </div>
                                    <button type="button" onClick={() => setEtapa(2)} className="btn-enviar">Iniciar Inscrição</button>
                                </div>
                            )}

                            {etapa === 2 && (
                                <div className="animate-fade">
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Identificação</h2>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>Inicie informando seu CPF para recuperarmos seu histórico.</p>
                                    <div style={{ position: 'relative' }}>
                                        <input name="cpf" placeholder="000.000.000-00" onChange={handleChange} value={dados.cpf} maxLength="14" className="input-field" autoFocus required />
                                        {loadingCpf && <div className="loading-spinner-small">Consultando...</div>}
                                    </div>
                                    <div style={{ marginTop: '20px' }}>
                                        {!cpfVerificado ? (
                                            <button type="button" onClick={verificarCpfExistente} className="btn-enviar" disabled={loadingCpf || dados.cpf.length < 14}>
                                                {loadingCpf ? 'Aguarde...' : 'Verificar Cadastro'}
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => setEtapa(3)} className="btn-enviar" style={{ backgroundColor: '#059669' }}>
                                                CPF Verificado! Continuar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {etapa === 3 && (
                                <div className="animate-fade">
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Dados do Tutor</h2>
                                    <input name="nomeTutor" placeholder="Nome Completo" onChange={handleChange} value={dados.nomeTutor} className="input-field" required />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input name="whatsapp" placeholder="WhatsApp" onChange={handleChange} value={dados.whatsapp} maxLength="15" className="input-field" style={{ flex: 1 }} required />
                                        <input name="email" type="email" placeholder="E-mail" onChange={handleChange} value={dados.email} className="input-field" style={{ flex: 1 }} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input name="logradouro" placeholder="Rua / Logradouro" onChange={handleChange} value={dados.logradouro} className="input-field" style={{ flex: 3 }} required />
                                        <input name="numero" placeholder="Nº" onChange={handleChange} value={dados.numero} className="input-field" style={{ flex: 1 }} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input name="bairro" placeholder="Bairro" onChange={handleChange} value={dados.bairro} className="input-field" style={{ flex: 2 }} required />
                                        <input name="cidade" value="Tatuí" className="input-field" style={{ flex: 1, backgroundColor: '#f1f5f9' }} readOnly />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button type="button" onClick={() => setEtapa(2)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}>Voltar</button>
                                        <button type="button" onClick={nextStep} className="btn-enviar" style={{ flex: 2 }}>Próximo: Dados do Pet</button>
                                    </div>
                                </div>
                            )}

                            {etapa === 4 && (
                                <div className="animate-fade">
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>Dados do Pet</h2>
                                    <input name="nomePet" placeholder="Nome do Animal" onChange={handleChange} value={dados.nomePet} className="input-field" required />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select name="especie" onChange={handleChange} value={dados.especie} className="input-field">
                                            <option value="CACHORRO">Cachorro</option>
                                            <option value="GATO">Gato</option>
                                        </select>
                                        <select name="sexo" onChange={handleChange} value={dados.sexo} className="input-field">
                                            <option value="MACHO">Macho</option>
                                            <option value="FEMEA">Fêmea</option>
                                        </select>
                                    </div>
                                    <input name="idadeAprox" placeholder="Idade Aproximada (Ex: 2 anos)" onChange={handleChange} value={dados.idadeAprox} className="input-field" style={{ marginTop: '10px' }} required />
                                    
                                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="vacinado" checked={dados.vacinado} onChange={handleChange} /> Possui vacinas em dia?
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" name="operouAntes" checked={dados.operouAntes} onChange={handleChange} /> Já realizou outras cirurgias?
                                        </label>
                                    </div>
                                    
                                    <textarea name="medicamentos" placeholder="Alguma observação médica, alergia ou uso de remédios?" onChange={handleChange} value={dados.medicamentos} className="input-field" style={{ marginTop: '10px', height: '80px', paddingTop: '10px' }} />

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="button" onClick={prevStep} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}>Voltar</button>
                                        <button type="button" onClick={nextStep} className="btn-enviar" style={{ flex: 2 }}>Próximo: Pagamento</button>
                                    </div>
                                </div>
                            )}

                            {etapa === 5 && (
                                <div className="animate-fade">
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>Pagamento da Taxa</h2>
                                    <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '15px', border: '2px dashed #3b82f6', marginBottom: '15px' }}>
                                        <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#1e40af', marginBottom: '10px' }}>VALOR ÚNICO: R$ 20,00</p>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>
                                            Efetue o PIX para a chave abaixo:<br/>
                                            <strong style={{ fontSize: '1rem', color: '#1e293b' }}>sistemacastracao@gmail.com</strong><br/>
                                            Sistema Castracao ong
                                        </p>
                                    </div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Anexe o comprovante (Foto ou PDF):</label>
                                    <input type="file" onChange={(e) => setArquivo(e.target.files[0])} className="input-field" accept="image/*,.pdf" required />
                                    
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="button" onClick={prevStep} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}>Voltar</button>
                                        <button type="button" onClick={handleSubmit} className="btn-enviar" style={{ flex: 2 }}>Enviar e Finalizar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CadastroTutor;

// RESUMO DO CÓDIGO:
// 1. Correção de Rota: A URL do POST foi alterada de /cadastro para /cadastros para alinhar com o backend e SecurityConfig.
// 2. FormData Refinado: O objeto 'dados' agora é enviado como um Blob JSON, garantindo que o Spring Boot consiga mapear o DTO sem erros de Media Type.
// 3. Identidade da ONG: Atualizada a chave PIX e o nome da ONG no passo 5 conforme as diretrizes do projeto.