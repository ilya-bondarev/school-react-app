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
    const [loading, setLoading] = useState(true); // Adding loading state
    const { logout, refreshAccessToken } = useAuth();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchProfile = async () => {
        try {
            setLoading(true); // Start loading
            const response = await fetch(`${config.apiBaseUrl}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 401) {
                await refreshAccessToken();
                const retryResponse = await fetch(`${config.apiBaseUrl}/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!retryResponse.ok) {
                    throw new Error('Error loading profile after token refresh');
                }
                const retryData = await retryResponse.json();
                setProfile(retryData);
            } else if (!response.ok) {
                throw new Error('Error loading profile');
            } else {
                const data = await response.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            logout();
        } finally {
            setLoading(false); // End loading
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading }; // Also return loading state
};

export default useProfile;