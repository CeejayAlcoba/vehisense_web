import { Table, Modal, Input, Button, Space } from "antd";
import { useEffect, useState } from "react";
import type { VehicleLogs } from "../../../../types/VehicleLogs";
import { WarningOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import _vehicleLogsService from "../../../../services/vehicleLogsService";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";

const { Search } = Input;

type OverDueDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function OverDueDialog({ isVisible, setIsVisible }: OverDueDialogProps) {
  const [overDues, setOverDues] = useState<VehicleLogs[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  // Fetch overdue vehicles
  const handleGetOverDues = async () => {
    const data = await _vehicleLogsService.GetUnregisterOverDues();
    setOverDues(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    handleGetOverDues();
  }, [isVisible]);

  // Filtered data based on searchValue
  const filteredOverDues = overDues.filter((v) =>
    v.plateNumber.toLowerCase().includes(searchValue.toLowerCase())
  );

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

  // Navigate to Warning List page
  const goToWarningList = () => {
    navigate(
      `/warning-blacklist?plate=${encodeURIComponent(searchValue)}&view=warning`
    );
    setIsVisible(false);
  };

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
      {/* Search Section */}
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search plate number..."
          enterButton={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={goToWarningList} // Enter key navigates
          allowClear
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={goToWarningList} // Button click navigates
          icon={<SearchOutlined />}
        >
          Go to Warning List
        </Button>
      </Space>

      {/* Table with pagination */}
      <Table
        columns={columns}
        dataSource={filteredOverDues}
        rowKey="id"
        pagination={{ pageSize: 10 }} // 10 rows per page
      />
    </Modal>
  );
}
