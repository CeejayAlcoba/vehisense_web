import { useState } from "react";
import { Table, Drawer, Select, Button, Space, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import { SettingOutlined } from "@ant-design/icons";
import _roleService from "../../../services/roleService";
import _sidebarService from "../../../services/sidebarService";
import _sidebarRoleMappingService from "../../../services/sidebarRoleMappingService";
import { SidebarRoleMapping } from "../../../types/SidebarRoleMapping";
import Toast from "../../../components/toast/Toast";
import { Sidebar } from "../../../types/Sidebar";
// assuming you have a role service

export default function RolePage() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedSidebarIds, setSelectedSidebarIds] = useState<number[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => await _roleService.getAllAsync(),
    initialData: [],
  });

  // Fetch all sidebars
  const { data: allSidebars } = useQuery({
    queryKey: ["sidebars"],
    queryFn: async () => await _sidebarService.getAllAsync(),
    initialData: [],
  });

  // Fetch mappings for the selected role
  const { refetch: refetchMappings } = useQuery({
    queryKey: ["sidebar-role-mappings", selectedRole],
    queryFn: async () => {
      if (!selectedRole) return [];
      const mappings = await _sidebarRoleMappingService.getByRoleIdAsync(
        selectedRole
      );
      setSelectedSidebarIds(
        mappings.map((m: SidebarRoleMapping) => m.sidebarId!)
      );
      return mappings;
    },
    enabled: false,
  });

  // Open drawer & load mappings
  const handleManageClick = async (roleId: number) => {
    await setSelectedRole(roleId);
    setDrawerVisible(true);
    await refetchMappings();
  };

  // Save mappings
  const handleSave = async () => {
    if (!selectedRole) return;
    const payload: SidebarRoleMapping[] = selectedSidebarIds.map(
      (sidebarId) => ({
        roleId: selectedRole,
        sidebarId,
      })
    );

    await _sidebarRoleMappingService.mergeAsync(payload);
    Toast("Mappings updated successfully");
    setDrawerVisible(false);
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Tooltip title="Manage Sidebar Items">
          <Button
            icon={<SettingOutlined />}
            onClick={() => handleManageClick(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={roles} rowKey="id" />

      <Drawer
        title={`Manage Sidebar Items for Role`}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Space>
        }
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Select sidebar items"
          value={selectedSidebarIds}
          onChange={setSelectedSidebarIds}
        >
          {allSidebars.map((sb: Sidebar) => (
            <Select.Option key={sb.id} value={sb.id}>
              {sb.name}
            </Select.Option>
          ))}
        </Select>
      </Drawer>
    </div>
  );
}
