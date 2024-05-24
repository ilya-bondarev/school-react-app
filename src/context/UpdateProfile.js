import axios from 'axios';
import config from '../config';

const updateProfile = async (data) => {

    const formData = new FormData();
    formData.append('full_name', data.full_name);
    formData.append('description', data.description);
    if (data.photo) {
        formData.append('photo', `${config.apiBaseUrl}/profile-photo/${data.photo}`);
    }

    await axios.post(`${config.apiBaseUrl}/update-profile`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
};

export default updateProfile;