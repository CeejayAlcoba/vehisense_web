import { useState } from "react";
import {
  Table,
  Drawer,
  Select,
  Button,
  Space,
  Tooltip,
  Form,
  Input,
  Modal,
  Popconfirm,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  PlusOutlined,
  EditOutlined,
  SettingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import _roleService from "../../../services/roleService";
import _sidebarService from "../../../services/sidebarService";
import _sidebarRoleMappingService from "../../../services/sidebarRoleMappingService";
import { SidebarRoleMapping } from "../../../types/SidebarRoleMapping";
import Toast from "../../../components/toast/Toast";
import { Sidebar } from "../../../types/Sidebar";

export default function RolePage() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedSidebarIds, setSelectedSidebarIds] = useState<number[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: roles, refetch: refetchRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => await _roleService.getAllAsync(),
    initialData: [],
  });

  const { data: allSidebars } = useQuery({
    queryKey: ["sidebars"],
    queryFn: async () => await _sidebarService.getAllAsync(),
    initialData: [],
  });

  const handleSidebarRoleMapping = async (roleId: number) => {
    if (!roleId) return [];
    const mappings = await _sidebarRoleMappingService.getByRoleIdAsync(roleId);
    setSelectedSidebarIds(
      mappings.map((m: SidebarRoleMapping) => m.sidebarId!)
    );
    return mappings;
  };

  const openAddRoleModal = () => {
    setEditingRole(null);
    form.resetFields();
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: any) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields();
      if (editingRole) {
        await _roleService.updateAsync(editingRole.id, values);
        Toast("Role updated successfully");
      } else {
        await _roleService.insertAsync(values);
        Toast("Role added successfully");
      }
      setIsRoleModalOpen(false);
      refetchRoles();
    } catch (error) {
      console.error(error);
    }
     setSaving(false)
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await _roleService.deleteByIdAsync(roleId);
      Toast("Role deleted successfully");
      refetchRoles();
    } catch (error) {
      console.error(error);
    }
  };

  const handleManageClick = async (roleId: number) => {
    setSelectedRole(roleId);
    setDrawerVisible(true);
    await handleSidebarRoleMapping(roleId);
  };

  const handleSaveSidebarMappings = async () => {
    setSaving(true)
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
      setSaving(false)
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
        <Space>
          <Tooltip title="Edit Role">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditRoleModal(record)}
            />
          </Tooltip>
          <Tooltip title="Manage Sidebar Items">
            <Button
              icon={<SettingOutlined />}
              onClick={() => handleManageClick(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Role">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddRoleModal}
        >
          Add Role
        </Button>
      </Space>

      <Table columns={columns} dataSource={roles} rowKey="id" />

      {/* Role Add/Update Modal */}
      <Modal
        title={editingRole ? "Update Role" : "Add Role"}
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        okButtonProps={{loading:saving}}
        onOk={handleSaveRole}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Role Name"
            name="name"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sidebar Mapping Drawer */}
      <Drawer
        title={`Manage Sidebar Items for Role`}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSaveSidebarMappings} loading={saving}>
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
