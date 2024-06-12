import { useNavigate } from 'react-router-dom';
import useProfile from '../context/useProfile';

const Profile = () => {
    const navigate = useNavigate();
    const { profile, loading } = useProfile();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        window.location.reload();
    };

    const handleProfileChange = () => {
        navigate('/edit-profile');
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading screen while data is loading
    }

    return (
        <div className="user-profile">
            <h1>User Profile</h1>
            <div className="profile-details">
                <img src={profile.photo} alt="Profile" style={{ maxWidth: '50%' }} />
                <p><strong>Name:</strong> {profile.full_name}</p>
                <p><strong>Role:</strong> 
                    {profile.role_id === 2 && (<span> Teacher</span>)}
                    {profile.role_id === 3 && (<span> Student</span>)}
                </p>
                <p><strong>Login:</strong> {profile.login}</p>
                <p><strong>Registration Date:</strong> {new Date(profile.registration_date).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {profile.description}</p>
            </div>
            <div className="profile-actions">
                <button className="btn change-profile-btn" onClick={handleProfileChange}>Edit Profile</button>
                <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Profile;