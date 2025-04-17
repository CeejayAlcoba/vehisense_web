import { useQuery } from "@tanstack/react-query";
import { Card, theme } from "antd";
import {
  CarOutlined,
  FieldTimeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import _vehicleService from "../../../services/vehicleService";
import { REFETCH_INTERVAL } from "../../../configs/request.config";

export default function HomeCard() {
  const { token } = theme.useToken();

  const { data: totals } = useQuery({
    queryKey: ["totals"],
    queryFn: async () => await _vehicleLogsService.GetTotals(),
    initialData: {
      total: 0,
      registred: 0,
      unRegistered: 0,
    },
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: totalRegistered } = useQuery({
    queryKey: ["totalRegistered"],
    queryFn: async () => await _vehicleService.CountAll(),
    initialData: 0,
    refetchInterval: REFETCH_INTERVAL,
  });

  const iconStyle:React.CSSProperties = {
    fontSize: "5rem",
    opacity: 0.2,
    position: "absolute",
    top: "1rem",
    left: "1rem",
  };

  return (
    <div className="row gap-2 text-center">
      <Card
        className="col-sm position-relative"
        style={{ backgroundColor: "#044f1f", color: "#ffffff" }}
      >
        <CarOutlined style={iconStyle} />
        <strong>TOTAL REGISTERED VEHICLES</strong>
        <h1>{totalRegistered}</h1>
      </Card>

      <Card
        className="col-sm position-relative"
        style={{ backgroundColor: token.colorPrimary, color: "#ffffff" }}
      >
        <FieldTimeOutlined style={iconStyle} />
        <strong>TOTAL VEHICLE ENTRIES</strong>
        <h1>{totals.total}</h1>
      </Card>

      <Card
        className="col-sm position-relative"
        style={{ backgroundColor: "#2189ff", color: "#ffffff" }}
      >
        <CheckCircleOutlined style={iconStyle} />
        <strong>TOTAL REGISTERED ENTRIES</strong>
        <h1>{totals.registred}</h1>
      </Card>

      <Card
        className="col-sm position-relative"
        style={{ backgroundColor: "#c94949", color: "#ffffff" }}
      >
        <CloseCircleOutlined style={iconStyle} />
        <strong>TOTAL UNREGISTERED ENTRIES</strong>
        <h1>{totals.unRegistered}</h1>
      </Card>
    </div>
  );
}
