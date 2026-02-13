import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const gerarGuiaCastracao = (agendamento) => {
    const doc = new jsPDF();
    
    // Ajuste: O objeto que vem da busca por Hash pode ter campos levemente diferentes
    // Garantimos que pegamos os dados independente se vem do Dashboard ou da busca Hash
    const { cadastro, codigoHash, dataHora, local, hash } = agendamento;
    const { tutor, pet } = cadastro;
    const hashFinal = codigoHash || hash;

    // --- CONFIGURAÇÃO DE CORES ---
    const AZUL_ESCURO = [0, 51, 102];
    const AZUL_CLARO = [214, 234, 248];
    const CINZA_TEXTO = [80, 80, 80];

    // --- CABEÇALHO ---
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...AZUL_ESCURO);
    doc.text("PRONTUÁRIO DE ENCAMINHAMENTO", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    // AJUSTADO: Nome oficial da ONG conforme solicitado
    doc.text("SISTEMA CASTRACAO ONG - CONTROLE DE ZOONOSES", 105, 22, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(200, 0, 0);
    doc.text(`CÓDIGO DE VALIDAÇÃO: ${hashFinal}`, 105, 30, { align: "center" });

    // --- SEÇÃO 1: DADOS DO TUTOR ---
    autoTable(doc, {
        startY: 40,
        head: [['DADOS DO RESPONSÁVEL (TUTOR)']],
        body: [
            [`NOME: ${tutor.nome.toUpperCase()}`],
            [`CPF: ${tutor.cpf} `],
            [`ENDEREÇO: ${tutor.endereco}`], 
            [`TELEFONE: ${tutor.whatsapp || tutor.telefone || 'NÃO INFORMADO'}  |  E-MAIL: ${tutor.email}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: AZUL_ESCURO },
        styles: { fontSize: 9, cellPadding: 2 }
    });

    // --- SEÇÃO 2: PRONTUÁRIO DO ANIMAL ---
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['PRONTUÁRIO CLÍNICO DO ANIMAL']],
        body: [
            [`NOME: ${pet.nomeAnimal.toUpperCase()}  |  ESPÉCIE: ${pet.especie}`],
            [`SEXO: ${pet.sexo || '---'}  |  IDADE APROX.: ${pet.idadeAprox || '---'}`],
            [`VACINADO: ${pet.vacinado ? 'SIM' : 'NÃO'}  |  JÁ OPEROU ANTES: ${pet.operouAntes ? 'SIM' : 'NÃO'}`],
            [`MEDICAMENTOS EM USO: ${pet.medicamentos || 'NENHUM INFORMADO'}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [40, 116, 166] },
        styles: { fontSize: 9, cellPadding: 2 }
    });

    // --- SEÇÃO 3: LOGÍSTICA DO PROCEDIMENTO ---
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['INFORMAÇÕES DA CASTRAÇÃO']],
        body: [
            [`DATA E HORA: ${dataHora ? new Date(dataHora).toLocaleString('pt-BR') : 'A DEFINIR'}`],
            [`LOCAL: ${local || 'CLÍNICA PARCEIRA'}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [93, 173, 226] },
        styles: { fontSize: 9 }
    });

    // --- SEÇÃO 4: ASSINATURAS ---
    const finalY = doc.lastAutoTable.finalY + 25;
    doc.setDrawColor(0);
    doc.line(20, finalY, 90, finalY); 
    doc.setFontSize(8);
    doc.setTextColor(...CINZA_TEXTO);
    doc.text("ASSINATURA DO TUTOR / RESPONSÁVEL", 30, finalY + 5);

    doc.line(120, finalY, 190, finalY);
    doc.text("ASSINATURA E CARIMBO DO VETERINÁRIO", 125, finalY + 5);

    // --- RODAPÉ ---
    doc.setFillColor(...AZUL_CLARO);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...AZUL_ESCURO);
    doc.text("Este documento é obrigatório para a realização do procedimento.", 105, 287, { align: "center" });
    // AJUSTADO: Email oficial da ONG conforme solicitado
    doc.text("Dúvidas: sistemacastracao@gmail.com", 105, 292, { align: "center" });

    doc.save(`Prontuario_${pet.nomeAnimal}_${hashFinal}.pdf`);
};

// Resumo do código: 
// Este script utiliza a biblioteca jsPDF para gerar o documento oficial de encaminhamento da ONG. 
// Ele organiza os dados em quatro seções visuais (Tutor, Animal, Logística e Assinaturas), 
// garantindo que todos os dados obrigatórios para a castração estejam documentados e assinados, 
// facilitando a auditoria posterior e o histórico de vida do animal.