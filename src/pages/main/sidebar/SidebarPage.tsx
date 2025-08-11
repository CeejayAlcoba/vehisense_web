import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tooltip,
  Table,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Sidebar } from "../../../types/Sidebar";
import _sidebarService from "../../../services/sidebarService";
import Toast from "../../../components/toast/Toast";
import AntIcon from "../../../components/antIcon/AntIcon";

export default function SidebarPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<Sidebar | null>(null);

  // Load sidebar items
  const { data: sidebarItems, refetch } = useQuery({
    queryKey: ["sidebar-items"],
    queryFn: async () => await _sidebarService.getAllAsync(),
    initialData: [],
  });

  // Show modal for add or edit
  const showModal = (record?: Sidebar) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
  };

  // Save (Add or Update)
  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (editingRecord?.id) {
          await _sidebarService.updateAsync(editingRecord.id ?? 0, {
            ...editingRecord,
            ...values,
          });
          Toast("Successfully updated");
        } else {
          await _sidebarService.insertAsync(values);
          Toast("Successfully added");
        }
        setIsModalVisible(false);
        form.resetFields();
        refetch();
      })
      .catch((info) => console.log("Validation Failed:", info));
  };

  // Cancel modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Delete record
  const handleDelete = async (id: number) => {
    await _sidebarService.deleteByIdAsync(id);
    Toast("Successfully deleted");
    refetch();
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Icon",
      dataIndex: "antIcon",
      key: "antIcon",
      render: (value: string) => (
        <>
          <AntIcon icon={value} />
          {value}
        </>
      ),
    },
     {
      title: "Path",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Sidebar) => (
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
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => showModal()}
      >
        Add Sidebar Item
      </Button>

      <Table columns={columns} dataSource={sidebarItems} />

      <Modal
        title={editingRecord ? "Update Sidebar Item" : "Add Sidebar Item"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name!" }]}
          >
            <Input />
          </Form.Item>
          <AntIcon icon={form.getFieldValue("antIcon")} />
          <Form.Item
            name="antIcon"
            label="Ant Design Icon Name"
            rules={[{ required: true, message: "Please enter the icon name!" }]}
          >
            <Input placeholder="Example: HomeOutlined" />
          </Form.Item>
          <Form.Item
            name="path"
            label="Path"
            rules={[{ required: true, message: "Please enter the path!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
