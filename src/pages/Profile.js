import { useNavigate } from 'react-router-dom';
import getProfile from '../context/GetProfile';

const Profile = () => {
    const navigate = useNavigate();
    const profile = getProfile();

    const handleLogout = () => {
        localStorage.removeItem('accessToken'); 
        localStorage.removeItem('refreshToken'); 
        navigate('/login');
        window.location.reload();
    };
    
    //TODO: Сделать изменение профиля
    const handleProfileChange = () => {
        navigate('/edit-profile');
    };

    return (
        <div className="user-profile">
        <h1>Профиль пользователя</h1>
        <div className="profile-details">
            <img src={profile.photo} alt="Profile" style={{maxWidth: 50 + '%'}}/>
            <p><strong>Имя:</strong> {profile.full_name}</p>
            <p><strong>Роль:</strong> {profile.role_id}</p>
            <p><strong>Логин:</strong> {profile.login}</p>
            <p><strong>Дата регистрации:</strong> {new Date(profile.registration_date).toLocaleDateString()}</p>
            <p><strong>Описание:</strong> {profile.description}</p>
        </div>
        {profile.role_id === 2 && (
            <div>
                Профиль учителя
            </div>
        )}
        {profile.role_id === 3 && (
            <div>
                Профиль ученика
            </div>
        )}
        <div className="profile-actions">
            <button className="btn change-profile-btn" onClick={handleProfileChange}>Изменить профиль</button>
            <button className="btn logout-btn" onClick={handleLogout}>Выход</button>
        </div>
    </div>
    );
};

export default Profile;