import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getProfile from '../context/GetProfile';
import updateProfile from '../context/UpdateProfile';
import ProfilePhotoUpload from '../context/ProfilePhotoUpload';
import config from '../config';

const EditProfile = () => {
    const navigate = useNavigate();
    const profile = getProfile();
    const [formData, setFormData] = useState({
        full_name: '',
        description: '',
        photo: '',
    });

    useEffect(() => {
        if (!profile) {
            navigate('/login');
        } else {
            setFormData({
                full_name: profile.full_name || '',
                description: profile.description || '',
                photo: profile.photo || '',
            });
        }
    }, [profile, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileUpload = (filename) => {
        setFormData({ ...formData, photo: filename });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    return (
        <div className="edit-profile-container">
            <h1>Редактировать профиль</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full_name">Имя:</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Фото профиля:</label>
                    <ProfilePhotoUpload onFileUpload={handleFileUpload} />
                    {formData.photo && (
                        <div>
                            <p>Current photo: {formData.photo}</p>
                            <img src={`${config.apiBaseUrl}/profile-photo/${formData.photo}`} alt="Profile" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                </div>
                <button type="submit">Сохранить изменения</button>
            </form>
        </div>
    );
};

export default EditProfile;