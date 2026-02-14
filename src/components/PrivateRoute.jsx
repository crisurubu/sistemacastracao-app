import React, { useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { authenticated, loading, user } = useContext(AuthContext);

    // Removemos os consoles daqui para manter a privacidade e limpeza do sistema

    if (loading) return (
        <div className="p-10 text-emerald-500 text-center font-black italic uppercase animate-pulse">
            Sincronizando permissões...
        </div>
    ); 

    if (!authenticated) {
        return <Navigate to="/admin/login" />;
    }

    // Validação de nível de acesso (Master, Voluntario, Clinica)
    if (allowedRoles && !allowedRoles.includes(user?.nivelAcesso)) {
        if (user?.nivelAcesso === 'CLINICA') {
            return <Navigate to="/clinica/agenda" />;
        }
        return <Navigate to="/admin/painel" />;
    }

    return children;
};

export default PrivateRoute;