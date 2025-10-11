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
  Tag,
  Select,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import _userService from "../../../services/userService";
import _roleService from "../../../services/roleService";
import Toast from "../../../components/toast/Toast";
import { UsersDTO, UsersTbl } from "../../../types/UsersTbl";
import { RolesTbl } from "../../../types/RolesTbl";

const { Option } = Select;

export default function UserPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<UsersDTO | null>(null);
  const [searchText, setSearchText] = useState("");
  const queryClient = useQueryClient();

  // Load users
  const { data: userItems = [] } = useQuery({
    queryKey: ["user-items"],
    queryFn: () => _userService.getAllAsync(),
  });

  // Load roles
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await _roleService.getAllAsync();
      return res?.map((r) => ({ value: r.id, label: r.name })) || [];
    },
  });

  // Mutation for add/update
  const saveUserMutation = useMutation({
    mutationFn: async (values: UsersTbl) => {
      if (editingRecord?.id) {
        return _userService.updateAsync(editingRecord.id, values);
      } else {
        return _userService.insertAsync(values);
      }
    },
    onSuccess: () => {
      Toast(editingRecord ? "Successfully updated" : "Successfully added");
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["user-items"] }); // Refetch table
    },
    onError: (err) => {
      console.error(err);
      Toast("Operation failed");
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: UsersTbl = {
        username: values.username,
        roleId: values.roleId,
      };
      saveUserMutation.mutate(payload);
    } catch (err) {
      Toast("Validation failed");
    }
  };

  const showModal = (record?: UsersDTO) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        username: record.username,
        roleId: record.role.id,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: number) => {
    await _userService.deleteByIdAsync(id);
    Toast("Successfully deleted");
    queryClient.invalidateQueries({ queryKey: ["user-items"] });
  };

  const filteredUsers = userItems.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.role.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: RolesTbl) => <Tag>{role?.name}</Tag>,
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
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by username or role"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Add User
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? "Update User" : "Add User"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter username!" }]}
          >
            <Input />
          </Form.Item>

          {!editingRecord && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select role" options={roles} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
