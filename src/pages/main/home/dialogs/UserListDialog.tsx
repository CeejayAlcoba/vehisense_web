import { Modal, Table, Tag, Input, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UsersTbl } from "../../../../types/UsersTbl";
import _userService from "../../../../services/userService";
import { formatTo12HourWithDate } from "../../../../utils/dateTimeUtility";
import { RolesTbl } from "../../../../types/RolesTbl";

type UserListDialogProps = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UserListDialog({ isVisible, setIsVisible }: UserListDialogProps) {
  const [users, setUsers] = useState<UsersTbl[]>([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async () => {
    const data = await _userService.getAllAsync();
    setUsers(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchUsers();
  }, [isVisible]);

  // Filter users dynamically as you type
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  // Navigate to UserPage
  const goToUserPage = () => {
    navigate(`/users`); // <-- Path to UserPage.tsx
    setIsVisible(false);
  };

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
      render: (value: RolesTbl) => (
        <Tag color={value?.id === 1 ? "blue" : "green"}>
          {value?.name || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => formatTo12HourWithDate(value),
    },
  ];

  return (
    <Modal
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined />
          User Accounts
        </span>
      }
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={800}
    >
      {/* Search + Go to User Page */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search username..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Button
          type="primary"
          onClick={goToUserPage}
          icon={<SearchOutlined />}
        >
          Go to Users
        </Button>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
