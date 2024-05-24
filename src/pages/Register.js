import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import ProfilePhotoUpload from '../context/ProfilePhotoUpload';

const Register = () => {
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [description, setDescription] = useState('');
    const [role, setRole] = useState(3); // Default to student role
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors
        
        try {
            const response = await axios.post(`${config.apiBaseUrl}/register`, {
                login: username,
                password: password,
                role_id: role,
                full_name: fullName,
                photo: `${config.apiBaseUrl}/profile-photo/${uploadedFileName}`,
                description: description
            });
            
            localStorage.setItem('accessToken', response.data.access_token);
            localStorage.setItem('refreshToken', response.data.refresh_token);

            navigate('/profile'); 
            window.location.reload();
        } catch (error) {
            
            const errorMessage = error.response?.data.detail || 'Failed to register. Please try again later.';
            setError(errorMessage);
        }
    };
    const handleFileUpload = (fileName) => {
        setUploadedFileName(fileName);
    };

    return (
        <div className="login-register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <label>
                    Uploaded Profile Photo
                    {uploadedFileName && ( 
                        <img src={`${config.apiBaseUrl}/profile-photo/${uploadedFileName}`} alt="Profile" style={{maxWidth: 50 + '%'}}/>
                    )}
                    <ProfilePhotoUpload onFileUpload={handleFileUpload} />
                </label>
                <label>
                    Username (Email):
                    <input
                        type="email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Full Name:
                    <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </label>
                <label>
                    Role:
                    <select value={role} onChange={e => setRole(Number(e.target.value))}>
                        <option value={2}>Teacher</option>
                        <option value={3}>Student</option>
                    </select>
                </label>
                <button type="submit">Register</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            <p className="login-register-link">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;