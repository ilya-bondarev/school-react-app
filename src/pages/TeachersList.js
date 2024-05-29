import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import getProfile from '../context/GetProfile';

const TeachersList = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [minRating, setMinRating] = useState('');
    const [maxLessons, setMaxLessons] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [dateTime, setDateTime] = useState('');
    const [duration, setDuration] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const profile = getProfile();

    useEffect(() => {
        async function fetchTeachers() {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/teachers`);
                setTeachers(response.data);
                setFilteredTeachers(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке списка учителей:', error);
            }
        }

        fetchTeachers();
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            let filtered = teachers;

            if (minRating !== '') {
                filtered = filtered.filter(teacher => teacher.averageRating >= parseFloat(minRating));
            }

            if (maxLessons !== '') {
                filtered = filtered.filter(teacher => teacher.totalLessons <= parseInt(maxLessons, 10));
            }

            setFilteredTeachers(filtered);
        };

        applyFilters();
    }, [teachers, minRating, maxLessons]);

    const formatLessonCount = (count) => {
        if (count >= 200) {
            return 'больше 200';
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
                alert('Lesson created successfully!');
                closePopup();
            }
        } catch (error) {
            console.error('Ошибка при создании урока:', error);
            setError('Failed to create lesson. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="teachers-list-container">
    <h1>Список учителей</h1>
    <div className="filters">
        <label>
            Минимальная оценка:
            <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
            />
        </label>
        <label>
            Максимальное количество уроков:
            <input
                type="number"
                min="0"
                value={maxLessons}
                onChange={(e) => setMaxLessons(e.target.value)}
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
                    <p>Средняя оценка: {teacher.rating}</p>
                    <p>Проведено уроков: {formatLessonCount(teacher.lessons_amount)}</p>
                    {profile.role_id !== 2 && (
                        <div className="buttons-container">
                            <button className="select-time-button" onClick={() => handleMoreDetails(teacher.id)}>
                                Выбрать время
                            </button>
                            <button className="more-details-button" onClick={() => handleMoreDetails(teacher.id)}>
                                Подробнее
                            </button>
                        </div>
                    )}
                </div>
            </li>
        )) : <p>Учителей не найдено по текущим фильтрам.</p>}
    </ul>
    {selectedTeacherId && (
        <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h2>Записаться на урок</h2>
                <form onSubmit={handleSignUpForLesson}>
                    <label>
                        Дата и время:
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Продолжительность (минуты):
                        <input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                        />
                    </label>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Записываем...' : 'Записаться'}
                    </button>
                </form>
                <button className="close-button" onClick={closePopup}>Закрыть</button>
            </div>
        </div>
    )}
</div>

    );
};

export default TeachersList;
