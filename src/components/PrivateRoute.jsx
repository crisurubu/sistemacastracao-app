import React, { useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { authenticated, loading, user } = useContext(AuthContext);

    // Enquanto o AuthContext verifica o localStorage ou valida o token, exibimos o loading
    if (loading) return (
        <div className="p-10 text-emerald-500 text-center font-black italic uppercase animate-pulse">
            Sincronizando permissões...
        </div>
    ); 

    // Se não estiver autenticado, manda direto para o login
    if (!authenticated) {
        return <Navigate to="/admin/login" />;
    }

    // Se a rota exige cargos específicos e o usuário não os tem
    if (allowedRoles && !allowedRoles.includes(user?.nivelAcesso)) {
        // Redirecionamento inteligente: Clínicas vão para sua agenda, outros para o painel
        if (user?.nivelAcesso === 'CLINICA') {
            return <Navigate to="/clinica/agenda" />;
        }
        return <Navigate to="/admin/painel" />;
    }

    // Se passou por tudo, renderiza a página protegida
    return children;
};

export default PrivateRoute;