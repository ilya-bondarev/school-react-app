import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import TeachersList from './pages/TeachersList';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import WhiteBoard from './pages/WhiteBoard';
import ArchiveBoard from './pages/ArchiveBoard';
import MyLessons from './pages/MyLessons';
import EditProfile from './pages/EditProfile';

function AuthLinks() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? (
        <>
          <Link to="/profile" className="sidebar-item">Profile</Link>
          <Link to="/lessons" className="sidebar-item">My Lessons</Link>
        </>
      ) : (
        <Link to="/login" className="sidebar-item">Log In</Link>
      )}
    </>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
              <button onClick={toggleSidebar} className="button">☰</button>
            </div>

            <AuthLinks />
            <Link to="/teachers" className="sidebar-item">Teachers List</Link>
          </div>

          <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/teachers" element={<TeachersList />} />
              <Route path="/whiteboard" element={<WhiteBoard />} />
              <Route path="/archiveboard" element={<ArchiveBoard />} />
              <Route path="/lessons" element={<MyLessons />} />
              <Route path="/" element={<TeachersList />} exact />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
