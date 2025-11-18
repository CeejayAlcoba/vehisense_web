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
import _vehicleLogsService from "./services/vehicleLogsService";
import { playAlertSound } from "./components/alertSound/playAlertSound";
import BlacklistedVehiclePage from "./pages/main/blacklistedVehicle/BlacklistedVehiclePage";
import SidebarPage from "./pages/main/sidebar/SidebarPage";
import RolePage from "./pages/main/role/RolePage";
import VehicleLogsReport from "./pages/main/report/VehicleLogsReport";
import AuditLogsPage from "./pages/main/auditLogs/AuditLogsPage";
import { useState } from "react";
import { _indexDbService, indexDbService } from "./services/indexDBService";
import VehicleRegistrationForm from "./pages/public/vehicleRegistration/VehicleRegistrationForm";
import VehicleQrScanner from "./pages/main/vehicleQrScanner/VehicleQrScanner";
import UserPage from "./pages/main/users/UserPage";
import ProfilePage from "./pages/main/profile/ProfilePage";
import WarningListPage from "./pages/main/warning/WarningPage";
import ReportsPage from "./pages/main/reportPage/reportPage";
import WarningAndBlacklistPage from "./pages/main/warningBlacklistPage/WarningAndBlacklistPage";
import OverDueMinutesPage from "./pages/main/OverDueMinutes/OverDueMinutesPage";
import DetectionStatusPage from "./pages/main/detectionStatusPage/DetectionStatusPage";
import ExitDetectionStatusPage from "./pages/main/detectionStatusPage/ExitDetectionStatusPage";
import CombinedStatusPage from "./pages/main/detectionStatusPage/CombinedStatusPage";

function AppRoute() {
  const { user } = useUserContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useQuery({
    queryKey: ["over-due-alert"],
    queryFn: async () => {
      if (!user) return [];
      const overDues = await _vehicleLogsService.GetUnregisterOverDues();
      const idbOverDues = await indexDbService.getSingleItemByFilter(
        "vehicleLogs",
        (c) => c.id == 1
      );
      const idbIds = new Set(idbOverDues?.vehicleLogs?.map((d: any) => d.id));

      const overdueFilter = overDues.filter((o) => !idbIds.has(o.id));
      if (overdueFilter.length > 0 && !isOpen) {
        Toast(
          <div>
            <strong>⚠️ Overdue Warning</strong>
            <div>
              Unregistered vehicles.
              <div>
                {overdueFilter?.map((o) => (
                  <div className="flex gap-2">
                    <span>
                      Plate No:<strong>{o.plateNumber}</strong>
                    </span>
                    {" - "}
                    <span>{o.vehicleType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          {
            type: "error",
            autoClose: false,
            pauseOnHover: false,
            onClose: async () => {
              setIsOpen(false);
              await indexDbService.upsertItem("vehicleLogs", {
                vehicleLogs: overDues,
                id: 1,
              });
            },
            onOpen: () => {
              setIsOpen(true);
            },
          }
        );
        playAlertSound();
      }
      return [];
    },
    refetchInterval: 10000,
    staleTime: 10000,
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
          <Route path="/black-listed" element={<BlacklistedVehiclePage />} />
          <Route path="/sidebar" element={<SidebarPage />} />
          <Route path="/role" element={<RolePage />} />
          <Route path="/report" element={<VehicleLogsReport />} />
          <Route path="/qr-scanner" element={<VehicleQrScanner />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/users" element={<UserPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/warning-list" element={<WarningListPage />} />
          <Route path="/reportPage" element={<ReportsPage />} />
          <Route path="/blacklisted" element={<BlacklistedVehiclePage />} />
          <Route path="/warninglist" element={<WarningListPage />} />
            <Route path="/over-due-minutes" element={<OverDueMinutesPage />} />
            <Route path="/detection-status" element={<DetectionStatusPage />} />
            <Route path="/detection-status/exit" element={<ExitDetectionStatusPage />} />
<Route path="/detection-status/combined" element={<CombinedStatusPage />} />

        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/vehicle-registration"
          element={<VehicleRegistrationForm />}
        />
       
      </Routes>
    </Router>
  );
}

export default AppRoute;
