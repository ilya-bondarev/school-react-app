import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { BsCheckCircle, BsXCircle } from 'react-icons/bs';
import getProfile from '../context/GetProfile';

const Lessons = () => {
    const [pendingLessons, setPendingLessons] = useState([]);
    const [confirmedLessons, setConfirmedLessons] = useState([]);
    const [rejectedLessons, setRejectedLessons] = useState([]);
    const [archivedLessons, setArchivedLessons] = useState([]);
    const [error, setError] = useState(null);
    const profile = getProfile();
    const navigate = useNavigate();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            const pendingResponse = await axios.get(`${config.apiBaseUrl}/lessons/status/1`);
            const confirmedResponse = await axios.get(`${config.apiBaseUrl}/lessons/status/2`);
            const rejectedResponse = await axios.get(`${config.apiBaseUrl}/lessons/status/4`);
            const archivedResponse = await axios.get(`${config.apiBaseUrl}/lessons/status/3`);
            setPendingLessons(pendingResponse.data);
            setConfirmedLessons(confirmedResponse.data);
            setRejectedLessons(rejectedResponse.data);
            setArchivedLessons(archivedResponse.data);
        } catch (error) {
            console.error('Ошибка при загрузке уроков:', error);
            setError('Failed to load lessons. Please try again.');
        }
    };

    const goToWhiteBoard = (lessonId, studentId, teacherId) => {
        navigate(`/whiteboard?lessonId=${lessonId}&studentId=${studentId}&teacherId=${teacherId}`);
    };

    const goToArchiveBoard = (lessonId, studentId, teacherId) => {
        navigate(`/archiveboard?lessonId=${lessonId}&studentId=${studentId}&teacherId=${teacherId}`);
    };

    const handleStatusUpdate = async (lessonId, statusId) => {
        try {
            await axios.put(`${config.apiBaseUrl}/lessons/${lessonId}/status`, { status_id: statusId });
            fetchLessons();
        } catch (error) {
            console.error('Ошибка при обновлении статуса урока:', error);
            setError('Failed to update lesson status. Please try again.');
        }
    };

    const renderLessonCard = (lesson, showButtons) => {
        const lessonDateTime = new Date(lesson.date_time.replace(' ', 'T'));
        const isTeacher = profile.role_id === 2; // role_id 2 for teachers
        const userToShow = isTeacher ? lesson.student : lesson.teacher;

        if (!userToShow) {
            return null; // Skip this lesson if userToShow is undefined
        }

        return (
            <div key={lesson.id} className="lesson-card">
                <div className="lesson-info">
                    {userToShow.photo && (
                        <img src={userToShow.photo} alt={`${userToShow.full_name}'s avatar`} className="user-photo" />
                    )}
                    <p><strong>{isTeacher ? 'Student' : 'Teacher'}:</strong> {userToShow.full_name}</p>
                    <p><strong>Time:</strong> {lessonDateTime.toLocaleString()}</p>
                    <p><strong>Duration:</strong> {lesson.duration} minutes</p>
                </div>
                {showButtons && profile.role_id === 2 && (
                    <div className="buttons-container">
                        <button onClick={() => handleStatusUpdate(lesson.id, 2)} className="accept-button">
                            <BsCheckCircle /> Accept
                        </button>
                        <button onClick={() => handleStatusUpdate(lesson.id, 4)} className="reject-button">
                            <BsXCircle /> Reject
                        </button>
                    </div>
                )}
                {lesson.status_id === 2 && (
                    <button onClick={() => goToWhiteBoard(lesson.id, lesson.student_id, lesson.teacher_id)} className="join-button">Join</button>
                )}
                {lesson.status_id === 3 && (
                    <button onClick={() => goToArchiveBoard(lesson.id, lesson.student_id, lesson.teacher_id)} className="join-button">View Archive</button>
                )}
            </div>
        );
    };

    return (
        <div className="lessons-container">
            <h1 className="lessons-title">My Lessons</h1>
            {error && <p className="error">{error}</p>}

            <h2>Confirmed Lessons</h2>
            <ul className="lessons-list">
                {confirmedLessons.length ? confirmedLessons.map((lesson) => renderLessonCard(lesson, false)) : <p>No confirmed lessons.</p>}
            </ul>

            <h2>Pending Lessons</h2>
            <ul className="lessons-list">
                {pendingLessons.length ? pendingLessons.map((lesson) => renderLessonCard(lesson, true)) : <p>No pending lessons.</p>}
            </ul>

            <h2>Rejected Lessons</h2>
            <ul className="lessons-list">
                {rejectedLessons.length ? rejectedLessons.map((lesson) => renderLessonCard(lesson, false)) : <p>No rejected lessons.</p>}
            </ul>

            <h2>Archived Lessons</h2>
            <ul className="lessons-list">
                {archivedLessons.length ? archivedLessons.map((lesson) => renderLessonCard(lesson, false)) : <p>No archived lessons.</p>}
            </ul>
        </div>
    );
};

export default Lessons;
