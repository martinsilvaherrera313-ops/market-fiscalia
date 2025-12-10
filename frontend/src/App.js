import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ScrollButton from './components/ScrollButton';
import InactivityWarning from './components/InactivityWarning';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import PublicationDetail from './pages/PublicationDetail';
import CreatePublication from './pages/CreatePublication';
import EditPublication from './pages/EditPublication';
import MyPublications from './pages/MyPublications';
import EditProfile from './pages/EditProfile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <ScrollButton />
          <InactivityWarning />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/publicacion/:id" 
              element={
                <PrivateRoute>
                  <PublicationDetail />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/crear-publicacion" 
              element={
                <PrivateRoute>
                  <CreatePublication />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/editar-publicacion/:id" 
              element={
                <PrivateRoute>
                  <EditPublication />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/mis-publicaciones" 
              element={
                <PrivateRoute>
                  <MyPublications />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/editar-perfil" 
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
