import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { BsCheckCircle, BsXCircle } from 'react-icons/bs';
import useProfile from '../context/useProfile';

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [pendingLessons, setPendingLessons] = useState([]);
    const [confirmedLessons, setConfirmedLessons] = useState([]);
    const [rejectedLessons, setRejectedLessons] = useState([]);
    const [archivedLessons, setArchivedLessons] = useState([]);
    const [error, setError] = useState(null);
    const { profile, loading } = useProfile(); // Using useProfile hook
    const navigate = useNavigate();

    useEffect(() => {
        if (profile?.id) {
            fetchLessons(profile.id);
        }
    }, [profile]);

    const fetchLessons = async (userId) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/lessons/user/${userId}`);
            const lessons = response.data;
            setLessons(lessons);
            distributeLessonsByStatus(lessons);
        } catch (error) {
            console.error('Error loading lessons:', error);
            setError('Failed to load lessons. Please try again.');
        }
    };

    const distributeLessonsByStatus = (lessons) => {
        const pending = lessons.filter(lesson => lesson.status_id === 1);
        const confirmed = lessons.filter(lesson => lesson.status_id === 2);
        const rejected = lessons.filter(lesson => lesson.status_id === 4);
        const archived = lessons.filter(lesson => lesson.status_id === 3);
        
        setPendingLessons(pending);
        setConfirmedLessons(confirmed);
        setRejectedLessons(rejected);
        setArchivedLessons(archived);
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
            if (profile?.id) {
                fetchLessons(profile.id);
            }
        } catch (error) {
            console.error('Error updating lesson status:', error);
            setError('Failed to update lesson status. Please try again.');
        }
    };

    const renderLessonCard = (lesson, showButtons) => {
        const lessonDateTime = new Date(lesson.date_time.replace(' ', 'T'));
        const isTeacher = profile?.role_id === 2; // role_id 2 for teachers
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
                {showButtons && isTeacher && (
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
                    <button onClick={() => goToArchiveBoard(lesson.id, lesson.student_id, lesson.teacher_id)} className="join-button">View</button>
                )}
            </div>
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="lessons-container">
            <h1 className="lessons-title">My Lessons</h1>
            {error && <p className="error">{error}</p>}

            <h2>Confirmed Lessons</h2>
            <ul className="lessons-list">
                {confirmedLessons.length ? confirmedLessons.map((lesson) => renderLessonCard(lesson, false)) : <p>No confirmed lessons.</p>}
            </ul>

            <h2>Pending Confirmation</h2>
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