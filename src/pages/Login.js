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
                Page refresh is necessary to update the buttons in the sidebar
                Delay for update is needed so that the token has time to update on the server and does not cause an error
            */
            setTimeout(() => {
                window.location.reload();
            }, 1500);
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
                    Email:
                    <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} required />
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
