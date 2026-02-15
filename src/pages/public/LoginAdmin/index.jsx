import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
// 1. IMPORTANTE: Importar a nossa configuração da API
import api from '../../../services/api'; 

const LoginAdmin = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        const loginData = {
            email: email.trim(),
            senha: senha.trim()
        };

        try {
            // 2. MUDANÇA AQUI: Trocamos o 'fetch' pelo 'api.post'
            // O axios já sabe que deve completar com a URL do Render
            const response = await api.post('/auth/login', loginData);

            // 3. O Axios coloca os dados direto em .data
            const data = response.data;

            login(data.user, data.token);
            
            if (data.user.nivelAcesso === 'CLINICA') {
                navigate('/admin/dashboard-clinica');
            } else {
                navigate('/admin/painel');
            }
            
        } catch (err) {
            // 4. Tratamento de erro para o Axios
            if (err.response && err.response.status === 401) {
                setErro('E-mail ou senha incorretos.');
            } else if (err.response && err.response.status === 403) {
                setErro('Acesso negado. Verifique se sua conta está ativa.');
            } else {
                setErro('Erro de conexão com o servidor da ONG.');
            }
        }
    };

    // ... restante do seu código (o visual do formulário continua igual)
    return (
        /* Seu código de retorno visual aqui */
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4">
            {/* O conteúdo do seu JSX é o mesmo */}
        </div>
    );
};

export default LoginAdmin;