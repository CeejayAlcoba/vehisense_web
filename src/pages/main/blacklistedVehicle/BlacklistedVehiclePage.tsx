import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tooltip,
  DatePicker,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Toast from "../../../components/toast/Toast";
import Table from "../../../components/table/Table";
import { BlacklistedVehicles } from "../../../types/BlacklistedVehicles";
import _blacklistedVehiclesService from "../../../services/blacklistedVehiclesService";

export default function BlacklistedVehiclePage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<BlacklistedVehicles | null>(null);

  const { data: blacklistedVehicles, refetch } = useQuery({
    queryKey: ["blacklisted-vehicles"],
    queryFn: async () => await _blacklistedVehiclesService.getAllAsync(),
    initialData: [],
  });

  const showModal = (record?: BlacklistedVehicles) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        blacklistedAt: record.blacklistedAt ? dayjs(record.blacklistedAt) : undefined,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        const payload = {
          ...values,
          blacklistedAt: values.blacklistedAt?.toDate?.() ?? new Date(),
        };

        if (editingRecord?.id) {
          await _blacklistedVehiclesService.updateAsync(editingRecord.id, payload);
          Toast("Successfully updated");
        } else {
          await _blacklistedVehiclesService.insertAsync(payload);
          Toast("Successfully added");
        }

        setIsModalVisible(false);
        form.resetFields();
        refetch();
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: number) => {
    await _blacklistedVehiclesService.deleteByIdAsync(id);
    Toast("Successfully deleted");
    refetch();
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
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BlacklistedVehicles) => (
        <Space>
          <Tooltip title="Edit">
            <EditOutlined
              style={{ color: "#1890ff", cursor: "pointer" }}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record.id ?? 0)}
            >
              <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => showModal()}
      >
        Add to Blacklist
      </Button>

      <Table columns={columns} dataSource={blacklistedVehicles} />

      <Modal
        title={editingRecord ? "Update Blacklist" : "Blacklist a Vehicle"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Blacklist"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vehiclePlate"
            label="Plate Number"
            rules={[{ required: true, message: "Please input the plate number!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason for Blacklisting"
            rules={[{ required: true, message: "Please input the reason!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
