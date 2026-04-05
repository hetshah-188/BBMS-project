import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import DonorDashboard from './pages/DonorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestBlood from './pages/RequestBlood';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />

          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['recipient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/request-blood" element={<RequestBlood />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/hospital-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback routes */}
          <Route path="/why-donate" element={<About />} />
          <Route path="/become-donor" element={<Signup />} />
          <Route path="/contact" element={<About />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
