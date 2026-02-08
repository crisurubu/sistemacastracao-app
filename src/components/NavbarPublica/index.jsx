import React, { useState, useEffect } from 'react';
import './style.css';

const NavbarPublica = () => {
    const [dataHora, setDataHora] = useState(new Date());
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setDataHora(new Date()), 1000);
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        return () => clearInterval(timer);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    return (
        <nav className="nav-public">
            <div className="nav-brand">
                <span className="nav-emoji">🐾</span>
                {/* Adicionado translate="no" para impedir que o Google mude o nome da ONG */}
                <div className="nav-title-group" translate="no">
                    <span className="nav-main-title">Mutirão de Castração</span>
                    <span className="nav-subtitle">ONG Tatuí-SP</span>
                </div>
            </div>

            <div className="nav-items">
                <div className="nav-clock" translate="no">
                    {dataHora.toLocaleDateString('pt-BR')} | <strong>{dataHora.toLocaleTimeString('pt-BR')}</strong>
                </div>

                {deferredPrompt && (
                    <button onClick={handleInstall} className="nav-btn-pwa">
                        Instalar App
                    </button>
                )}
            </div>
        </nav>
    );
};

export default NavbarPublica;