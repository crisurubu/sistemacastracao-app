import React, { useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { authenticated, loading, user } = useContext(AuthContext);
    console.log("Estado Auth:", { authenticated, loading, user });
    console.log("Permissões Necessárias:", allowedRoles);

    if (loading) return <div className="p-10 text-white text-center">Carregando permissões...</div>; 

    if (!authenticated) {
        return <Navigate to="/admin/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.nivelAcesso)) {
        if (user?.nivelAcesso === 'CLINICA') {
            return <Navigate to="/clinica/agenda" />;
        }
        return <Navigate to="/admin/painel" />;
    }

    return children;
};

export default PrivateRoute;