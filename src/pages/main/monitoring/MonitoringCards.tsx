import { Card } from "antd";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import { useQuery } from "@tanstack/react-query";
import { getColumns } from "./MonitoringPage";
import TextColor from "../../../components/text/TextColor";
import {
  CarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import Table from "../../../components/table/Table";
import { formatTo12Hour, getCurrentDateYMD } from "../../../utils/dateTimeUtility";

export default function MonitoringCards() {
  const dateToday = getCurrentDateYMD();
  const { data: entries } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => await _vehicleLogsService.getAllAsync({dateFrom:dateToday}),
    initialData: [],
    refetchInterval: 3000,
  });
  const { data: actives } = useQuery({
    queryKey: ["actives"],
    queryFn: async () => await _vehicleLogsService.GetActiveEntries({dateFrom:dateToday}),
    initialData: [],
    refetchInterval: 3000,
  });
  const { data: exits } = useQuery({
    queryKey: ["exits"],
    queryFn: async () => await _vehicleLogsService.GetExit({dateFrom:dateToday}),
    initialData: [],
    refetchInterval: 3000,
  });
  const exitColumns = (data: any) => {
    return [
      ...getColumns(data),
      {
        title: "E   xit Time",
        dataIndex: "exitTime",
        key: "exitTime",
        render: (text: any, record: any) => (
          <TextColor isDanger={!record.isRegistered}>
            {formatTo12Hour(text)}
          </TextColor>
        ),
      },
    ];
  };
  return (
    <div className="row gap-3">
      <div className="col-xl-5">
        <Card
          title={
            <span>
              <CarOutlined style={{ marginRight: 8 }} />
              Vehicle Entries
              ({entries.length})
            </span>
          }
        >
          <Table
            columns={getColumns(entries)}
            dataSource={entries}
            virtual
            pagination={false}
            scroll={{ x:200,y: 200 }}
          />
        </Card>
      </div>
      <div className="col-xl-6">
        <Card
          title={
            <span>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Unregistered Vehicle and Overdue Time
              ({entries.length})
            </span>
          }
        >
          <Table
            columns={getColumns(entries)}
            dataSource={entries}
            virtual
            pagination={false}
            scroll={{x:200, y: 200 }}
          />
        </Card>
      </div>
      <div className="col-xl-5">
        <Card
          title={
            <span>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              Active Vehicles
              ({actives.length})
            </span>
          }
        >
          <Table
            columns={getColumns(actives)}
            dataSource={actives}
            virtual
            pagination={false}
            scroll={{ x:200,y: 200 }}
          />
        </Card>
      </div>
      <div className="col-xl-6">
        <Card
          title={
            <span>
              <ExportOutlined style={{ marginRight: 8 }} />
              Vehicle Exits
              ({exits.length})
            </span>
          }
        >
          <Table
            columns={exitColumns(exits)}
            virtual
            pagination={false}
            dataSource={exits}
            scroll={{x:200, y: 200 }}
          />
        </Card>
      </div>
    </div>
  );
}
