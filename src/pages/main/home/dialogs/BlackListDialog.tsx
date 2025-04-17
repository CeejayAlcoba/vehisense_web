import { Modal, Table } from "antd";
import { useEffect, useState } from "react";
import { WarningOutlined } from "@ant-design/icons";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";
import _blacklistedVehiclesService from "../../../../services/blacklistedVehiclesService";
import { BlacklistedVehicles } from "../../../../types/BlacklistedVehicles";


type BlackListDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BlackListDialog({ isVisible, setIsVisible }: BlackListDialogProps) {
  const [blacklisted, setBlacklisted] = useState<BlacklistedVehicles[]>([]);

  const fetchBlacklisted = async () => {
    const data = await _blacklistedVehiclesService.getAllAsync();
    setBlacklisted(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchBlacklisted();
  }, [isVisible]);

  const columns = [
    {
      title: "Plate Number",
      dataIndex: "vehiclePlate",
      key: "vehiclePlate",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Blacklisted At",
      dataIndex: "blacklistedAt",
      key: "blacklistedAt",
      render: (value: string) => formatTo12HourWithDate(value),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WarningOutlined style={{ color: "red" }} />
          Blacklisted Vehicles
        </span>
      }
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={blacklisted}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
