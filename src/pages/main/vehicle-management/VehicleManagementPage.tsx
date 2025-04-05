import { useState } from "react";
import {  Button, Modal, Form, Input, Space, Popconfirm, Tooltip } from "antd";
import SelectVehicleType from "../../../components/select/SelectVehicleType";
import { useQuery } from "@tanstack/react-query";
import _vehicleService from "../../../services/vehicleService";
import { VehiclesTbl } from "../../../types/VehiclesTbl";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Toast from "../../../components/toast/Toast";
import Table from "../../../components/table/Table";

export default function VehicleManagementPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<VehiclesTbl | null>(null);
  const { data: vehicles,refetch } = useQuery({
    queryKey: ["vehicles-list"],
    queryFn:async()=>await _vehicleService.getAllAsync(),
    initialData: [],
  });
  const showModal = (record?: VehiclesTbl) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (editingRecord?.id) {
          await _vehicleService.updateAsync(editingRecord.id,values);
          Toast("Successfully updated")
        } else {
          await _vehicleService.insertAsync(values);
          Toast("Successfully added")
        }
        setIsModalVisible(false);
        form.resetFields();
        refetch();
       
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: number) => {
    await _vehicleService.deleteByIdAsync(id);
    refetch()
    Toast("Successfully deleted")
  };

  const columns = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Sticker Number",
      dataIndex: "stickerNumber",
      key: "stickerNumber",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: VehiclesTbl) => (
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
        Create
      </Button>
      <Table columns={columns} dataSource={vehicles}/>

      <Modal
        title={editingRecord ? "Update Entry" : "Create Entry"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="plateNumber"
            label="Plate Number"
            rules={[
              { required: true, message: "Please input the plate number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="owner"
            label="Owner Name"
            rules={[
              { required: true, message: "Please input the owner name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <SelectVehicleType
            name="vehicleType"
            label="Vehicle Type"
            rules={[
              { required: true, message: "Please input the vehicle type!" },
            ]}
          />
          <Form.Item
            name="stickerNumber"
            label="Sticker Number"
            rules={[
              { required: true, message: "Please input the sticker number!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
