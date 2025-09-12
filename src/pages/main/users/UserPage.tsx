import { lazy, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tooltip,
  Table,
  Tag,
  Select,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import _userService from "../../../services/userService";
import Toast from "../../../components/toast/Toast";
import { UsersDTO, UsersTbl } from "../../../types/UsersTbl";
import { RolesTbl } from "../../../types/RolesTbl";
import _roleService from "../../../services/roleService";

export default function UserPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<UsersTbl | null>(null);

  // Load user items
  const { data: userItems, refetch } = useQuery({
    queryKey: ["user-items"],
    queryFn: async () => await _userService.getAllAsync(),
    initialData: [],
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await _roleService.getAllAsync();
      return res?.map((r) => ({
        value: r.id,
        label: r.name,
      }));
    },
    initialData: [],
  });

  // Show modal for add or edit
  const showModal = (record?: UsersDTO) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        roleId: record.role.id,
      });
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
          await _userService.updateAsync(editingRecord.id ?? 0, {
            ...editingRecord,
            ...values,
          });
          Toast("Successfully updated");
        } else {
          await _userService.insertAsync(values);
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
    await _userService.deleteByIdAsync(id);
    Toast("Successfully deleted");
    refetch();
  };

  // Table columns
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "role",
      dataIndex: "role",
      key: "role",
      render: (role: RolesTbl) => {
        return <Tag>{role?.name}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UsersDTO) => (
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
        Add User Item
      </Button>

      <Table columns={columns} dataSource={userItems} />

      <Modal
        title={editingRecord ? "Update User Item" : "Add User Item"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter the username!" }]}
          >
            <Input />
          </Form.Item>
          {!form.getFieldValue("id") &&
           <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password!" },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          }
         
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select placeholder="Select a role" options={roles} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
