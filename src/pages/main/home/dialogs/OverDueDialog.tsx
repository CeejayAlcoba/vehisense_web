import { Table, Modal } from "antd";
import { useEffect, useState } from "react";
import type { VehicleLogs } from "../../../../types/VehicleLogs";
import dayjs from "dayjs";
import { WarningOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import _vehicleLogsService from "../../../../services/VehicleLogsService";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";

// Fake overdue data
const fakeOverdueLogs: VehicleLogs[] = [
  {
    id: 1,
    vehicleId: 101,
    plateNumber: "ABC-123",
    entryTime: new Date("2025-04-15T08:30:00"),
    isRegistered: true,
    vehicleType: "Car",
  },
  {
    id: 2,
    vehicleId: 102,
    plateNumber: "XYZ-456",
    entryTime: new Date("2025-04-14T14:00:00"),
    isRegistered: false,
    vehicleType: "Motorcycle",
  },
  {
    id: 3,
    vehicleId: 103,
    plateNumber: "LMN-789",
    entryTime: new Date("2025-04-13T10:45:00"),
    isRegistered: true,
    vehicleType: "Truck",
  },
];

type OverDueDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function OverDueDialog(props: OverDueDialogProps) {
  const { isVisible, setIsVisible } = props;
const [overDues,setOverDues]=useState<VehicleLogs[]>([])
const handleGetOverDues=async()=>{
   const data = await _vehicleLogsService.GetUnregisterOverDues();
   setOverDues(data)
}
  useEffect(()=>{
    if(!isVisible) return;
    handleGetOverDues();
  },[isVisible])

  const columns = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      key: "entryTime",
      render: (value: string) => formatTo12HourWithDate(value),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WarningOutlined style={{ color: "#faad14" }} />
          Overdue Vehicles
        </span>
      }
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={overDues}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
