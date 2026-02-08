import React from 'react';
import './style.css';

const Footer = () => (
    <footer className="footer-main">
        <div className="footer-content">
            <p className="footer-dev">
                Desenvolvido por <strong>Cristiano Machado Nunes Bispo</strong>
            </p>
            <span className="footer-tag">Engenheiro da Computação</span>
        </div>
        <div className="footer-bottom">
            © {new Date().getFullYear()} - Sistema de Gestão de Castração Social
        </div>
    </footer>
);

export default Footer;