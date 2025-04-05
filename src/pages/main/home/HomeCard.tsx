import { useQuery } from "@tanstack/react-query";
import { Card, theme } from "antd";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import _vehicleService from "../../../services/vehicleService";

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
    refetchInterval: 3000,
  });
  const { data: totalRegistered } = useQuery({
    queryKey: ["totalRegistered"],
    queryFn: async () => await _vehicleService.CountAll(),
    initialData: 0,
    refetchInterval: 3000,
  });
  console.log(totalRegistered)
  return (
    <div className="row gap-2 text-center">
      <Card
        className="col-sm"
        style={{
          backgroundColor: "#044f1f",

          color: "#ffffff",
        }}
      >
        <strong>TOTAL REGISTERED VEHICLES</strong>
        <h1>{totalRegistered}</h1>
      </Card>
      <Card
        className="col-sm"
        style={{ backgroundColor: token.colorPrimary, color: "#ffffff" }}
      >
       <strong>TOTAL VEHICLE ENTRIES</strong>
       <h1>{totals.total}</h1>
      </Card>
      <Card
        className="col-sm"
        style={{ backgroundColor: "#2189ff", color: "#ffffff" }}
      >
          <strong>TOTAL REGISTERED ENTRIES</strong>
          <h1>{totals.registred}</h1>
      </Card>
      <Card
        className="col-sm"
        style={{ backgroundColor: "#c94949", color: "#ffffff" }}
      >
        <strong>TOTAL UNREGISTERED ENTRIES</strong>
        <h1>{totals.unRegistered}</h1>
      </Card>
    </div>
  );
}
