import React, { useState, useEffect } from 'react';

const AdminHeader = () => {
    const [usuario, setUsuario] = useState({ nome: 'Admin', email: '', nivelAcesso: '' });

    useEffect(() => {
        const usuarioLogado = localStorage.getItem('usuario');
        if (usuarioLogado) {
            try {
                setUsuario(JSON.parse(usuarioLogado));
            } catch (error) {
                console.error("Erro ao ler dados do usuário", error);
            }
        }
    }, []);

    // Função para traduzir o nível de acesso para um nome amigável
    const formatarCargo = (nivel) => {
        switch (nivel) {
            case 'MASTER': return 'Administrador Master';
            case 'VOLUNTARIO': return 'Voluntário';
            case 'CLINICA': return 'Clínica Parceira';
            default: return 'Membro';
        }
    };

    return (
        <header className="h-16 bg-[#0f172a]/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-end px-8">
            
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-white">
                        {usuario.nome}
                    </p>
                    {/* AGORA DINÂMICO: Muda conforme o nível de acesso */}
                    <p className="text-[10px] text-blue-500 uppercase font-black tracking-wider">
                        {formatarCargo(usuario.nivelAcesso)}
                    </p>
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-700 shadow-lg shadow-blue-500/20">
                    {usuario.nome.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;