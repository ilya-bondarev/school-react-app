import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getProfile from '../context/GetProfile';
import config from '../config';

const MyLessons = () => {
    const profile = getProfile();
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const goToWhiteBoard = (lessonId, studentId, teacherId) => {
        navigate(`/whiteboard?lessonId=${lessonId}&studentId=${studentId}&teacherId=${teacherId}`);
    };
    
    useEffect(() => {
        if (!profile || !profile.id) {
            console.error('Profile or profile ID is undefined');
            return;
        }

        const fetchLessons = async () => {
            try {
                const id = profile.id;
                const response = await axios.get(`${config.apiBaseUrl}/lessons/user/${id}`);
                setLessons(response.data || []);
            } catch (err) {
                console.error('Error fetching lessons:', err);
                setError('Error fetching lessons');
            }
        };

        fetchLessons();
    }, [profile]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="lessons-container">
            <h1 className="lessons-title">My Lessons</h1>
            <ul className="lessons-list">
                {lessons.length === 0 ? (
                    <li className="no-lessons">No lessons available</li>
                ) : (
                    lessons.map(lesson => {
                        const lessonDateTime = new Date(lesson.date_time);
                        const now = new Date();
                        const isJoinAvailable = (lessonDateTime - now) <= 60 * 60 * 1000; // 1 hour in milliseconds

                        return (
                            <li key={lesson.id} className="lesson-item">
                                <div className="lesson-card">
                                    <div className="lesson-info">
                                        <p><strong>Lesson ID:</strong> {lesson.id}</p>
                                        <p><strong>Teacher ID:</strong> {lesson.teacher_id}</p>
                                        <p><strong>Student ID:</strong> {lesson.student_id}</p>
                                        <p><strong>Date:</strong> {lessonDateTime.toLocaleString()}</p>
                                        <p><strong>Duration:</strong> {lesson.duration} mins</p>
                                    </div>
                                    {isJoinAvailable && (
                                        <button 
                                            className="join-button" 
                                            onClick={() => goToWhiteBoard(lesson.id, lesson.student_id, lesson.teacher_id)}
                                        >
                                            Join
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );
};

export default MyLessons;