import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import TeachersList from './pages/TeachersList';
import PaymentPage from './pages/PaymentPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register'
import WhiteBoard from './pages/WhiteBoard';
import MyLessons from './pages/MyLessons';
import EditProfile from './pages/EditProfile';
function AuthLinks() {
    const { isAuthenticated } = useAuth();
    return (
      <>
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="sidebar-item">Профиль</Link>
            <Link to="/lessons" className="sidebar-item">Мои уроки</Link>
          </>
        ) : (
          <Link to="/login" className="sidebar-item">Войти в систему</Link>
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
                        <Link to="/teachers" className="sidebar-item">Список учителей</Link>
                    </div>

                    <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                        <Routes>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/edit-profile" element={<EditProfile />} />
                            <Route path="/teachers" element={<TeachersList />} />
                            <Route path="/whiteboard" element={<WhiteBoard />} />
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
