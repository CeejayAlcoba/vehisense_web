import { Modal, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
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

  const fetchUsers = async () => {
    const data = await _userService.getAllAsync(); 
    setUsers(data);
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchUsers();
  }, [isVisible]);

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
        render: (value: RolesTbl) => <Tag color={value.id === 1 ? "blue" : "green"}>{value.name}</Tag>,
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
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
