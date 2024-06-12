import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import useProfile from '../context/useProfile';

const TeachersList = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [minLessons, setMinLessons] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [dateTime, setDateTime] = useState('');
    const [duration, setDuration] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { profile, loading: profileLoading } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTeachers() {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/teachers`);
                setTeachers(response.data);
                setFilteredTeachers(response.data);
            } catch (error) {
                console.error('Error loading teachers list:', error);
            }
        }

        fetchTeachers();
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = teachers;

            if (minLessons !== '') {
                filtered = filtered.filter(teacher => teacher.lessons_amount >= parseInt(minLessons, 10));
            }

            setFilteredTeachers(filtered);
        };

        applyFilters();
    }, [teachers, minLessons]);

    const formatLessonCount = (count) => {
        if (count >= 200) {
            return 'more than 200';
        }
        return count;
    };

    const handleMoreDetails = (id) => {
        setSelectedTeacherId(id);
    };

    const closePopup = () => {
        setSelectedTeacherId(null);
        setDateTime('');
        setDuration('');
        setError(null);
    };

    const handleSignUpForLesson = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${config.apiBaseUrl}/lessons/`, {
                teacher_id: selectedTeacherId,
                student_id: profile.id,
                date_time: dateTime,
                duration: duration,
                status_id: 1
            });

            if (response.status === 200) {
                closePopup();
                navigate('/lessons');
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            setError('Failed to create lesson. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (profileLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="teachers-list-container">
            <h1>Teachers List</h1>
            <div className="filters">
                <label>
                    Minimum number of lessons:
                    <input
                        type="number"
                        min="0"
                        value={minLessons}
                        onChange={(e) => setMinLessons(e.target.value)}
                    />
                </label>
            </div>
            <ul className="teachers-list">
                {filteredTeachers.length ? filteredTeachers.map((teacher) => (
                    <li key={teacher.id} className="teacher-card">
                        <img src={teacher.photo} alt={teacher.full_name} className="teacher-photo" />
                        <div className="teacher-info">
                            <h3>{teacher.full_name}</h3>
                            <p>{teacher.description}</p>
                            <p>Lessons conducted: {formatLessonCount(teacher.lessons_amount)}</p>
                            {profile.role_id !== 2 && (
                                <div className="buttons-container">
                                    <button className="more-details-button" onClick={() => handleMoreDetails(teacher.id)}>
                                        Select Time
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                )) : <p>No teachers found with the current filters.</p>}
            </ul>
            {selectedTeacherId && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Sign Up for a Lesson</h2>
                        <form onSubmit={handleSignUpForLesson}>
                            <label>
                                Date and Time:
                                <input
                                    type="datetime-local"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Duration (minutes):
                                <input
                                    type="number"
                                    min="30"
                                    max="180"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    required
                                />
                            </label>
                            {error && <p className="error">{error}</p>}
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Signing up...' : 'Sign Up'}
                            </button>
                        </form>
                        <button className="close-button" onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersList;