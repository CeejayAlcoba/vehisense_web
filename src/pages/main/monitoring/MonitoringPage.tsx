import _vehicleLogsService from "../../../services/VehicleLogsService";
import { VehicleLogs } from "../../../types/VehicleLogs";
import TextColor from "../../../components/text/TextColor";
import MonitoringCards from "./MonitoringCards";
import MonitoringColorLegend from "./MonitoringColorLegend";
import { formatTo12Hour } from "../../../utils/dateTimeUtility";

export const getColumns = (data: any) => {
  return [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text: any, record: VehicleLogs) => (
        <TextColor isDanger={!record.isRegistered}>{text}</TextColor>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
      render: (text: any, record: VehicleLogs) => (
        <TextColor isDanger={!record.isRegistered}>{text}</TextColor>
      ),
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (values: string, record: VehicleLogs) => (
        <TextColor isDanger={!record.isRegistered}>
          {formatTo12Hour(values)}
        </TextColor>
      ),
    },
  ];
};
export default function MonitoringPage() {
  return (
    <>
      <div style={{ marginBottom: "200px" }}>
        <MonitoringCards />
      </div>
      <MonitoringColorLegend />
    </>
  );
}
