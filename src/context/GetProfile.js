import { useState, useEffect } from 'react';
import config from '../config';
import { useAuth } from './AuthContext';

const useProfile = () => {
    const [profile, setProfile] = useState({
        id: '',
        full_name: '',
        login: '',
        role_id: '',
        registration_date: '',
        photo: '',
        description: ''
    });
    const { logout, refreshAccessToken } = useAuth();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchProfile = async () => {
        try {
            // Adding a delay of 500 milliseconds
            await delay(500);
            const response = await fetch(`${config.apiBaseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                // Попытка обновления токена
                await refreshAccessToken();
                // Повторный запрос после обновления токена
                const retryResponse = await fetch(`${config.apiBaseUrl}/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!retryResponse.ok) {
                    throw new Error('Ошибка загрузки профиля после обновления токена');
                }

                const retryData = await retryResponse.json();
                setProfile(retryData);
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка загрузки профиля');
            }

            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
            logout();
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return profile;
};

export default useProfile;