import { Modal, Table, Tag } from "antd";
import { useEffect, useState } from "react";

import { CheckCircleOutlined } from "@ant-design/icons";
import { VehiclesTbl } from "../../../../types/VehiclesTbl";
import _vehicleService from "../../../../services/vehicleService";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";

type VehicleRegisterDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function VehicleRegisterDialog({ isVisible, setIsVisible }: VehicleRegisterDialogProps) {
  const [vehicles, setVehicles] = useState<VehiclesTbl[]>([]);

  const fetchVehicles = async () => {
    const data = await _vehicleService.getAllAsync();
    setVehicles(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchVehicles();
  }, [isVisible]);

  const columns = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Sticker Number",
      dataIndex: "stickerNumber",
      key: "stickerNumber",
      render: (value?: string) => value ?? <Tag color="default">N/A</Tag>,
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Registered At",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (value: string) => formatTo12HourWithDate(value),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          Registered Vehicles
        </span>
      }
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={vehicles}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
