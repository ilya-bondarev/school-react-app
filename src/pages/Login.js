import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import config from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${config.apiBaseUrl}/token`, {
                login: username,
                password: password
            });
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);


            navigate('/profile');
            /* 
                Обновление страницы необходимо для обновления кнопок в сайдбаре
                Задержка для обновления нужна чтобы на сервере успел обновиться токен и не выдавало ошибку
            */
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            alert('Failed to login');
            console.error(error);
        }
    };

    return (
        <div className="login-register-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
            <p className="login-register-link">
                First time here? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;
