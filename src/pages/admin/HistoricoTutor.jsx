import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// IMPORTANTE: Importando a instância centralizada da API que você criou
import api from "../../services/api"; 

const HistoricoTutor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historico, setHistorico] = useState([]);
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // MUDANÇA: Usando 'api.get' do Axios em vez de 'fetch'
        // A URL base e o Bearer Token já estão configurados no seu arquivo api.js
        api.get(`/cadastros/tutor/${id}`)
            .then(response => {
                const data = response.data;
                if (data && data.length > 0) {
                    setTutor(data[0].tutor);
                    setHistorico(data);
                }
                setLoading(false);
            })
            .catch(err => {
                // Tratamento silencioso para produção conforme solicitado
                setLoading(false);
            });
    }, [id]);

    const formatarData = (dataISO) => {
        if (!dataISO) return "---";
        return new Date(dataISO).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div style={{ backgroundColor: '#000814', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="fw-bold">SINCRONIZANDO PRONTUÁRIOS...</h2>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#000814', minHeight: '100vh', padding: '30px', color: '#fff' }}>
            
            <div className="d-flex justify-content-between mb-4 border-bottom border-secondary pb-3">
                <button className="btn btn-warning fw-bold px-4 shadow" onClick={() => navigate(-1)}>← VOLTAR</button>
                <div className="text-end">
                    <h4 style={{ fontWeight: '900', margin: 0, color: '#ffc300' }}>Sistema Castracao ong</h4>
                    <small className="fw-bold text-light">sistemacastracao@gmail.com</small>
                </div>
            </div>

            <div style={{ backgroundColor: '#001d3d', borderRadius: '15px', padding: '25px', border: '2px solid #ffc300', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                <div className="row">
                    <div className="col-md-7 border-end border-secondary">
                        <small className="text-primary fw-bold">RESPONSÁVEL PELO REGISTRO</small>
                        <h1 style={{ fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{tutor?.nome || "Tutor não identificado"}</h1>
                        <p className="mb-1 text-light"><strong>CPF:</strong> {tutor?.cpf || "---"}</p>
                    </div>
                    <div className="col-md-5 text-md-end ps-4">
                        <h2 style={{ color: '#00f5d4', fontWeight: '900' }}>{tutor?.whatsapp || "---"}</h2>
                        <p className="mb-0 fw-bold">{tutor?.endereco}</p>
                        <p className="small text-muted">{tutor?.bairro} — {tutor?.cidade}/SP</p>
                    </div>
                </div>
            </div>

            <h3 className="mb-4 fw-bold" style={{ borderLeft: '5px solid #ffc300', paddingLeft: '15px' }}>HISTÓRICO DE VIDA / AUDITORIA</h3>

            <div className="row g-4">
                {historico.length > 0 ? (
                    historico.map(cadastro => {
                        const isConcluido = cadastro.statusProcesso === "CONCLUIDO";
                        const dataExibicao = isConcluido ? (cadastro.pagamento?.dataConfirmacao || cadastro.dataSolicitacao) : cadastro.dataSolicitacao;

                        return (
                            <div key={cadastro.id} className="col-md-6">
                                <div style={{ backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', border: '4px solid #000', boxShadow: '10px 10px 0px #003566' }}>
                                    
                                    <div style={{ 
                                        backgroundColor: isConcluido ? '#198754' : '#0d6efd', 
                                        color: '#fff', padding: '15px', textAlign: 'center', fontWeight: '900', fontSize: '1.2rem' 
                                    }}>
                                        {isConcluido ? '✅ PROCEDIMENTO CONCLUÍDO' : `⚠️ STATUS: ${cadastro.statusProcesso}`}
                                    </div>

                                    <div className="p-4" style={{ color: '#000' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h2 style={{ fontWeight: '900', margin: 0 }}>{cadastro.pet?.nomeAnimal?.toUpperCase()}</h2>
                                            <span className="badge bg-dark px-3 py-2">{cadastro.pet?.sexo}</span>
                                        </div>

                                        <div className="p-3 mb-3 border rounded bg-light" style={{ border: '2px solid #000 !important' }}>
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold text-muted">{isConcluido ? 'CONCLUÍDO EM:' : 'SOLICITADO EM:'}</span>
                                                <span className="fw-bold text-primary">{formatarData(dataExibicao)}</span>
                                            </div>
                                        </div>

                                        <div className="row text-center g-2 mb-3">
                                            <div className="col-6 p-2 bg-light border fw-bold text-uppercase">{cadastro.pet?.especie}</div>
                                            <div className="col-6 p-2 bg-light border fw-bold">{cadastro.pet?.idadeAprox}</div>
                                        </div>

                                        {cadastro.pet?.medicamentos && (
                                            <div className="p-3 border-start border-4 border-danger bg-danger bg-opacity-10">
                                                <small className="fw-bold text-danger">🚨 NOTAS CLÍNICAS / ALERTA:</small>
                                                <p className="m-0 small fw-bold text-dark">{cadastro.pet.medicamentos}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center py-5">
                        <h4 className="text-muted">Nenhum histórico de castração encontrado.</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricoTutor;

