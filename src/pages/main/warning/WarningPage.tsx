import {
  Table,
  Button,
  Space,
  Tooltip,
  Popconfirm,
  Form,
  Modal,
  Input,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { DeleteOutlined } from "@ant-design/icons";
import Toast from "../../../components/toast/Toast";
import _warningListService from "../../../services/warningListService";
import _blacklistedVehiclesService from "../../../services/blacklistedVehiclesService";
import { useState, useMemo } from "react";

export default function WarningListPage() {
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistForm] = Form.useForm();
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [searchText, setSearchText] = useState("");

  const { data: warnings, refetch: refetchWarningLists } = useQuery({
    queryKey: ["warnings"],
    queryFn: async () => await _warningListService.getAllAsync(),
    initialData: [],
  });

  // Filtered warnings based on search
  const filteredWarnings = useMemo(() => {
    if (!searchText) return warnings;
    return warnings.filter(
      (w: any) =>
        w.plateNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        w.vehicleType.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, warnings]);

  const handleBlacklist = async () => {
    try {
      const values = await blacklistForm.validateFields();
      if (!selectedRecord) return;

      const payload = {
        vehiclePlate: selectedRecord.plateNumber,
        reason: values.reason,
      };

      await _blacklistedVehiclesService.insertAsync(payload);

      // Remove from warning list after blacklisting
      await _warningListService.deleteByPlateNumber(selectedRecord.plateNumber);

      Toast("Vehicle moved to Blacklist successfully");
      blacklistForm.resetFields();
      setIsBlacklistModalOpen(false);
      refetchWarningLists();
    } catch (error) {
      console.error(error);
      Toast("Failed to add to blacklist", { type: "error" });
    }
  };

  const handleDeleteWarningList = async (id: number) => {
    try {
      await _warningListService.deleteByIdAsync(id);
      Toast("WarningList deleted successfully");
      refetchWarningLists();
    } catch (error) {
      console.error(error);
    }
  };

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
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={() => handleDeleteWarningList(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete WarningList">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Add to Blacklist">
            <Button
              type="primary"
              onClick={() => {
                setSelectedRecord(record);
                setIsBlacklistModalOpen(true);
              }}
            >
              Blacklist
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Search Bar */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by Plate Number or Vehicle Type"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />
      </Space>

      <Table columns={columns} dataSource={filteredWarnings} rowKey="id" />

      <Modal
        title={
          <>
            Add to Blacklisted: Plate No.{" "}
            <strong>{selectedRecord?.plateNumber}</strong> -{" "}
            {selectedRecord?.vehicleType}
          </>
        }
        open={isBlacklistModalOpen}
        onOk={handleBlacklist}
        onCancel={() => {
          blacklistForm.resetFields();
          setIsBlacklistModalOpen(false);
        }}
        okText="Blacklist"
      >
        <Form form={blacklistForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please input the reason" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter reason for blacklisting"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
