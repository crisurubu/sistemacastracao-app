import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Importe sua api para o logout

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const recoveredUser = localStorage.getItem('usuario');
        // O token não é mais recuperado daqui, o navegador cuida disso.

        if (recoveredUser) {
            try {
                setUser(JSON.parse(recoveredUser));
            } catch (e) {
                console.error("Erro ao ler usuário do localStorage");
                localStorage.removeItem('usuario');
            }
        }
        setLoading(false);
    }, []);

    // Agora o login recebe apenas os dados do usuário (userData)
    const login = (userData) => {
        localStorage.setItem('usuario', JSON.stringify(userData));
        // localStorage.setItem('token', token); <-- REMOVIDO!
        setUser(userData);
    };

    const logout = async () => {
        try {
            // Chamamos o backend para ele limpar o Cookie HttpOnly
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Erro ao limpar cookie no servidor", err);
        } finally {
            // Limpa o estado local independente do sucesso da rede
            localStorage.removeItem('usuario');
            // localStorage.removeItem('token'); <-- REMOVIDO!
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};