import { Modal, Table, Input, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { WarningOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";
import _blacklistedVehiclesService from "../../../../services/blacklistedVehiclesService";
import { BlacklistedVehicles } from "../../../../types/BlacklistedVehicles";

const { Search } = Input;

type BlackListDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function BlackListDialog({ isVisible, setIsVisible }: BlackListDialogProps) {
  const [blacklisted, setBlacklisted] = useState<BlacklistedVehicles[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  // Fetch blacklisted vehicles
  const fetchBlacklisted = async () => {
    const data = await _blacklistedVehiclesService.getAllAsync();
    setBlacklisted(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchBlacklisted();
  }, [isVisible]);

  // Filter blacklisted vehicles based on searchValue
  const filteredData = blacklisted.filter(
    (item) =>
      item.vehiclePlate.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Navigate directly to Blacklist tab (ignores search)
  const goToBlacklistTab = () => {
    setIsVisible(false);
    navigate(`/warning-blacklist?tab=blacklist`);
  };

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
      {/* Search + Go to Blacklist */}
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search plate number..."
          enterButton={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={goToBlacklistTab}
          icon={<SearchOutlined />}
        >
          Go to Blacklist
        </Button>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Modal>
  );
}
