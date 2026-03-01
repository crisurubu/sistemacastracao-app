import React, { useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { authenticated, loading, user } = useContext(AuthContext);

    if (loading) return (
        <div className="min-h-screen bg-ong-dark flex items-center justify-center">
            <div className="text-ong-green text-center font-black italic uppercase animate-pulse">
                Sincronizando permissões...
            </div>
        </div>
    ); 

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.nivelAcesso)) {
        if (user?.nivelAcesso === 'CLINICA') return <Navigate to="/clinica/agenda" />;
        return <Navigate to="/admin/painel" />;
    }

    return children;
};

export default PrivateRoute;