import TextColor from "../../../components/text/TextColor";
import MonitoringCards from "./MonitoringCards";
import MonitoringColorLegend from "./MonitoringColorLegend";
import { formatTo12Hour } from "../../../utils/dateTimeUtility";
import { OverDueDTO } from "../../../types/OverDueDTO";

export const getColumns = (data: any) => {
  return [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text: any, record: OverDueDTO) => (
        <TextColor
          isDanger={!record.isRegistered && !record.isAllowed}
          isWarning={record.isInWarningList}
        >
          {text}
        </TextColor>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
      render: (text: any, record: OverDueDTO) => (
        <TextColor
          isDanger={!record.isRegistered && !record.isAllowed}
          isWarning={record.isInWarningList}
        >
          {text}
        </TextColor>
      ),
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (values: string, record: OverDueDTO) => (
        <TextColor
          isDanger={!record.isRegistered && !record.isAllowed}
          isWarning={record.isInWarningList}
        >
          {formatTo12Hour(values)}
        </TextColor>
      ),
    },
  ];
};
export default function MonitoringPage() {
  return (
    <>
      <MonitoringColorLegend />
      <div style={{ marginBottom: "200px" }}>
        <MonitoringCards />
      </div>
    </>
  );
}
