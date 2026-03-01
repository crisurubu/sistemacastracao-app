/**
 * CENTRAL DE NOTIFICAÇÕES - SISTEMA CASTRAÇÃO ONG
 */

const MESSAGES = {
    APROVADO: (tutor, pet) => 
        `Olá ${tutor}! O pagamento para a castração do(a) *${pet}* foi CONFIRMADO! ✅\n\n` +
        `Seu pet entrou na nossa fila oficial de espera. Aguarde nosso contato para o agendamento da cirurgia. 🐾`,
    
    REJEITADO: (tutor) => 
        `Olá ${tutor}, o comprovante enviado não pôde ser validado. ❌\n\n` +
        `*Motivo:* Valor divergente, comprovante antigo ou imagem ilegível.\n` +
        `Por favor, refaça o envio no sistema ou contate: sistemacastracao@gmail.com`,

    AGENDADO: (tutor, pet, data, hora, local, hash) =>
        `*AGENDAMENTO DE CASTRAÇÃO - SISTEMA CASTRACAO ONG*\n\n` +
        `Olá, ${tutor}! Temos boas notícias para o(a) *${pet}*! 📅\n\n` +
        `📅 *DATA:* ${data}\n` +
        `⏰ *HORÁRIO:* ${hora}\n` +
        `📍 *LOCAL:* ${local}\n` +
        `🔑 *CÓDIGO DE VALIDAÇÃO:* ${hash}\n\n` +
        `*IMPORTANTE:* Apresente este código na recepção da clínica. Sem ele, o atendimento social não poderá ser validado. ✅`,

    // NOVO: Mensagem de Reagendamento (V2)
    REAGENDADO: (tutor, pet, data, hora, local) =>
        `Olá *${tutor}*! 👋\n\nConfirmamos o reagendamento para a castração do(a) *${pet}*.\n\n📅 *DATA:* ${data}\n⏰ *HORA:* ${hora}\n🏥 *CLÍNICA:* ${local}\n\n_Por favor, leve a Guia de Castração e siga as orientações de jejum._`,

    // NOVO: Alerta de Jejum (V2)
    LEMBRETE_JEJUM: (tutor, pet, data, hora, local) =>
        `Olá *${tutor}*! 🐾\n\nLembrete da castração do(a) *${pet}* AMANHÃ, dia ${data}!\n\n⏰ *HORÁRIO:* ${hora}\n🏥 *LOCAL:* ${local}\n\n⚠️ *IMPORTANTE:* O animal deve estar em JEJUM TOTAL (água e comida) por 8 a 12 horas.`
};

export const messagesService = {
    // Função para o componente Agendados chamar
    gerarLinkReagendamento: (dados) => {
        const [data, horaCompleta] = dados.dataHora.split('T');
        const dataFormatada = data.split('-').reverse().join('/');
        const horaFormatada = horaCompleta.substring(0, 5);
        
        const msg = MESSAGES.REAGENDADO(dados.tutorNome, dados.petNome, dataFormatada, horaFormatada, dados.clinicaNome);
        return `https://wa.me/55${dados.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    },

    // Função para o lembrete de jejum
    gerarLinkLembrete: (item) => {
        const [data, horaCompleta] = item.dataHora.split('T');
        const dataFormatada = data.split('-').reverse().join('/');
        const horaFormatada = horaCompleta.substring(0, 5);
        
        const msg = MESSAGES.LEMBRETE_JEJUM(item.cadastro.tutor.nome, item.cadastro.pet.nomeAnimal, dataFormatada, horaFormatada, item.clinica?.nome);
        return `https://wa.me/55${item.cadastro.tutor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    }
};

// Mantém sua função antiga para compatibilidade com o Financeiro/Fila
export const enviarWhatsApp = (telefone, tipo, dados = {}) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const { tutor, pet, data, hora, local, hash } = dados;
    let mensagem = MESSAGES[tipo] ? MESSAGES[tipo](tutor, pet, data, hora, local, hash) : "Olá!";
    
    if (window.confirm(`Deseja abrir o WhatsApp?`)) {
        window.open(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`, '_blank');
    }
};

/**
 * RESUMO DO CÓDIGO (V2 INTEGRADA):
 * 1. Centralização: Adicionados os templates 'REAGENDADO' e 'LEMBRETE_JEJUM'.
 * 2. Objeto messagesService: Criado para atender o componente 'Agendados' que você criou, tratando as datas automaticamente.
 * 3. Compatibilidade: A função enviarWhatsApp continua funcionando para os disparos manuais da Fila.
 */