import React, { useState, useEffect } from 'react';
import './NavbarPublica.css'; // Vou sugerir o CSS abaixo

const NavbarPublica = () => {
    const [dataHora, setDataHora] = useState(new Date());
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setDataHora(new Date()), 1000);
        
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            clearInterval(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    return (
        <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🐾</span>
                <div className="flex flex-col" translate="no">
                    <span className="text-white font-black text-lg leading-tight tracking-tighter uppercase">Mutirão de Castração</span>
                    <span className="text-blue-500 text-[10px] font-bold tracking-widest">SISTEMA ONG TATUÍ-SP</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-slate-400 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800" translate="no">
                    {dataHora.toLocaleDateString('pt-BR')} | <strong className="text-blue-400">{dataHora.toLocaleTimeString('pt-BR')}</strong>
                </div>

                {deferredPrompt && (
                    <button 
                        onClick={handleInstall} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all animate-bounce"
                    >
                        Instalar App
                    </button>
                )}
            </div>
        </nav>
    );
};

export default NavbarPublica;

/**
 * RESUMO: Navbar voltada para o tutor externo. Contém lógica de PWA para instalação no celular
 * e relógio sincronizado para passar credibilidade durante o cadastro.
 */