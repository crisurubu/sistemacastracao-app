import React from 'react';

const Footer = () => (
    <footer className="bg-[#020617] border-t border-slate-900 py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-slate-500 text-xs font-medium">
                    Desenvolvido por <strong className="text-slate-300">Cristiano Machado Nunes Bispo</strong>
                </p>
                <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Engenheiro da Computação</span>
            </div>
            
            <div className="text-slate-600 text-[10px] font-bold text-center uppercase tracking-tighter">
                © {new Date().getFullYear()} - Sistema de Gestão de Castração Social <br/>
                <span className="text-slate-700 italic">Protegendo quem não tem voz.</span>
            </div>
        </div>
    </footer>
);

export default Footer;

/**
 * RESUMO: Rodapé simples e limpo. Uso de 'mt-auto' garante que ele fique no final da página 
 * mesmo em telas com pouco conteúdo.
 */