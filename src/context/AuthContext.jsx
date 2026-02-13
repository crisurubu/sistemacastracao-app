import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const recoveredUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (recoveredUser && token) {
            try {
                setUser(JSON.parse(recoveredUser));
            } catch (e) {
                console.error("Erro ao ler usuário do localStorage");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        // Removemos o navigate daqui!
    };

    const logout = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUser(null);
        // Se precisar deslogar, o redirecionamento será feito por quem chamar o logout
    };

    return (
        <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
            {/* Garantimos que só renderiza os filhos após carregar o estado inicial */}
            {!loading && children}
        </AuthContext.Provider>
    );
};