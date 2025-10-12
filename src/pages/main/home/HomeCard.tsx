import { useQuery } from "@tanstack/react-query";
import { Card, theme } from "antd";
import {
  CarOutlined,
  UserOutlined,
  WarningOutlined,
  StopOutlined,
} from "@ant-design/icons";
import _vehicleLogsService from "../../../services/vehicleLogsService";
import _vehicleService from "../../../services/vehicleService";
import _blacklistedVehiclesService from "../../../services/blacklistedVehiclesService";
import _userService from "../../../services/userService";
import { REFETCH_INTERVAL } from "../../../configs/request.config";
import { useState } from "react";
import OverDueDialog from "./dialogs/OverDueDialog";
import BlackListDialog from "./dialogs/BlackListDialog";
import UserListDialog from "./dialogs/UserListDialog";
import VehicleRegisterDialog from "./dialogs/VehicleRegisterDialog";

export default function HomeCard() {
  const { data } = useQuery({
    queryKey: ["totals"],
    queryFn: async () => {
      const registred = await _vehicleService.Count();
      const overDues = await _vehicleLogsService.CountUnregisterOverDues();
      const blackListed = await _blacklistedVehiclesService.Count();
      const user = await _userService.Count();
      return { registred, overDues, blackListed, user };
    },
    initialData: {
      registred: 0,
      overDues: 0,
      blackListed: 0,
      user: 0,
    },
    refetchInterval: REFETCH_INTERVAL,
  });

  const { registred, overDues, blackListed, user } = data;

  const iconStyle: React.CSSProperties = {
    fontSize: "5rem",
    opacity: 0.15,
    position: "absolute",
    top: "1rem",
    left: "1rem",
  };
  const [isOverDueVisible, setIsOverDueVisible] = useState(false);
  const [isBlackListVisible, setBlackListVisible] = useState(false);
  const [isUserVisible, setIsUserVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  return (
    <>
      <OverDueDialog
        isVisible={isOverDueVisible}
        setIsVisible={setIsOverDueVisible}
      />
      <BlackListDialog
        isVisible={isBlackListVisible}
        setIsVisible={setBlackListVisible}
      />
      <UserListDialog
        isVisible={isUserVisible}
        setIsVisible={setIsUserVisible}
      />
      <VehicleRegisterDialog
        isVisible={isRegisterVisible}
        setIsVisible={setIsRegisterVisible}
      />
      <div className="row gap-2 text-center">
        <Card
          className="col-sm position-relative"
          style={{ backgroundColor: "#044f1f", color: "#ffffff" }}
          onClick={() => setIsRegisterVisible(true)}
        >
          <CarOutlined style={iconStyle} />
          <strong>TOTAL REGISTERED VEHICLES</strong>
          <h1>{registred}</h1>
        </Card>

        <Card
          className="col-sm position-relative"
          style={{ backgroundColor: "#1e3a8a", color: "#ffffff" }}
          onClick={() => setIsUserVisible(true)}
        >
          <UserOutlined style={iconStyle} />
          <strong>TOTAL USERS</strong>
          <h1>{user}</h1>
        </Card>

        <Card
          className="col-sm position-relative"
          style={{ backgroundColor: "#9c1c1c", color: "#ffffff" }}
          onClick={() => setBlackListVisible(true)}
        >
          <StopOutlined style={iconStyle} />
          <strong>TOTAL BLACKLISTED</strong>
          <h1>{blackListed}</h1>
        </Card>

        <Card
          className="col-sm position-relative"
          style={{ backgroundColor: "#d97706", color: "#ffffff" }}
          onClick={() => setIsOverDueVisible(true)}
        >
          <WarningOutlined style={iconStyle} />
          <strong>TODAY OVERDUE</strong>
          <h1>{overDues}</h1>
        </Card>
      </div>
    </>
  );
}
