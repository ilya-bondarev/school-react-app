import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfile from '../context/useProfile';
import updateProfile from '../context/UpdateProfile';
import ProfilePhotoUpload from '../context/ProfilePhotoUpload';
import config from '../config';

const EditProfile = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();
    const [formData, setFormData] = useState({
        full_name: '',
        description: '',
        photo: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !profile) {
            navigate('/login');
        } else if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                description: profile.description || '',
                photo: profile.photo || '',
            });
        }
    }, [profile, loading, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileUpload = (filename) => {
        setFormData({ ...formData, photo: `${config.apiBaseUrl}/profile-photo/${filename}` });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateProfile(formData);
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="edit-profile-container">
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full_name">Name:</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Profile Photo:</label>
                    <ProfilePhotoUpload onFileUpload={handleFileUpload} />
                    {formData.photo && (
                        <div>
                            <p>Current photo:</p>
                            <img src={formData.photo} alt="Profile" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                </div>
                <button type="submit" disabled={isSubmitting}>Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;