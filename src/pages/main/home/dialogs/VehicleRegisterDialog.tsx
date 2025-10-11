import { Modal, Table, Tag, Input, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { CheckCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { VehiclesTbl } from "../../../../types/VehiclesTbl";
import _vehicleService from "../../../../services/vehicleService";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";
import { useNavigate } from "react-router-dom";

type VehicleRegisterDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function VehicleRegisterDialog({ isVisible, setIsVisible }: VehicleRegisterDialogProps) {
  const [vehicles, setVehicles] = useState<VehiclesTbl[]>([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Fetch vehicles
  const fetchVehicles = async () => {
    const data = await _vehicleService.getAllAsync();
    setVehicles(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchVehicles();
  }, [isVisible]);

  // Filter vehicles based on search input
  const filteredVehicles = vehicles.filter((v) =>
    v.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    v.owner.toLowerCase().includes(searchText.toLowerCase())
  );

  // Navigate to Vehicle Management page
  const goToVehicleManagement = () => {
    navigate("/vehicle-management"); // <-- Update path if different
    setIsVisible(false);
  };

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
      {/* Search + Go to Vehicle Management */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by plate number or owner"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          onClick={goToVehicleManagement}
          icon={<SearchOutlined />}
        >
          Go to Vehicle Management
        </Button>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredVehicles}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
