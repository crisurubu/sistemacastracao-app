import React from 'react';
import DashboardHome from './DashboardHome';

/**
 * PainelAdmin
 * Este componente serve como o container principal da Home do Administrador.
 * O Layout (Sidebar/Navbar) é gerenciado pelas rotas pai para evitar duplicação.
 */
const PainelAdmin = () => {
    return (
        <div className="animate-in fade-in duration-500">
            <DashboardHome />
        </div>
    );
};

export default PainelAdmin;