import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/public/login/LoginPage";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/main/home/HomePage";
import useUserContext from "./useUserContext";
import MonitoringPage from "./pages/main/monitoring/MonitoringPage";
import VehicleManagementPage from "./pages/main/vehicle-management/VehicleManagementPage";
import { useQuery } from "@tanstack/react-query";
import Toast from "./components/toast/Toast";
import { useEffect } from "react";
import _vehicleLogsService from "./services/VehicleLogsService";
import { playAlertSound } from "./components/alertSound/playAlertSound";

function AppRoute() {
  const { user } = useUserContext();
  useQuery({
    queryKey: ["over-due-alert"],
    queryFn: async () => {
      const overDues = await _vehicleLogsService.GetUnregisterOverDues();
      Toast(
        <div>
          <strong>⚠️ Overdue Warning</strong>
          <div>
            Unregistered vehicles.
            <div>
            {overDues?.map((o) =><div className="flex gap-2"><span>Plate No:<strong>{o.plateNumber}</strong></span>{" - "}<span>{o.vehicleType}</span></div>) }
            </div>
          </div>
        </div>,
        { type: "error", autoClose: 7000 }
      );
      playAlertSound();
    },
    refetchInterval: 10000,
    staleTime:10000,
  });
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<HomePage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route
            path="/vehicle-management"
            element={<VehicleManagementPage />}
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoute;
