
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/public/login/LoginPage';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/main/home/HomePage';
import useUserContext from './useUserContext';
import MonitoringPage from './pages/main/monitoring/MonitoringPage';
import VehicleManagementPage from './pages/main/vehicle-management/VehicleManagementPage';


function AppRoute() {
  const {user} = useUserContext();
  return (
    <Router>
      <Routes>
        <Route path="/"  element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<HomePage />} />
          <Route path='/monitoring' element={<MonitoringPage />} />
          <Route path='/vehicle-management' element={<VehicleManagementPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoute;