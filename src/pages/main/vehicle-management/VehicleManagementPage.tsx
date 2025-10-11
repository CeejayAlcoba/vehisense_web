import { useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tooltip,
  Table as AntTable,
  Select,
  Upload,
  message,
  DatePicker,
  Tag,
} from "antd";
import { RcFile } from "antd/es/upload";
import { useQuery } from "@tanstack/react-query";
import _vehicleRegistrationService from "../../../services/vehicleRegistrationService";
import _vehicleService from "../../../services/vehicleService";
import { VehiclesTbl } from "../../../types/VehiclesTbl";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  InboxOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Toast from "../../../components/toast/Toast";
import SelectVehicleType from "../../../components/select/SelectVehicleType";
import dayjs from "dayjs";

const { Option } = Select;
const { Dragger } = Upload;

export default function VehicleManagementPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<VehiclesTbl | null>(null);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoRecord, setInfoRecord] = useState<VehiclesTbl | null>(null);
  const [searchText, setSearchText] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);

  const { data: vehicles, refetch } = useQuery({
    queryKey: ["vehicles-list"],
    queryFn: async () => await _vehicleService.getAllAsync(),
    initialData: [],
  });

  const beforeUpload = (file: RcFile) => {
    const isPDF = file.type === "application/pdf";
    if (!isPDF) {
      message.error("You can only upload PDF files!");
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  const getExpirationStatus = (expirationDate?: string | null) => {
    if (!expirationDate) return { status: "none", text: "No Expiry", color: "default" };
    
    const expiry = dayjs(expirationDate);
    const today = dayjs();
    const daysUntilExpiry = expiry.diff(today, "day");

    if (daysUntilExpiry < 0) {
      return { status: "expired", text: "Expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", text: `Expires in ${daysUntilExpiry} days`, color: "orange" };
    } else {
      return { status: "valid", text: "Valid", color: "green" };
    }
  };

  const showModal = (record?: VehiclesTbl) => {
    setIsModalVisible(true);
    if (record) {
      setEditingRecord(record);
      
      // Prepare existing file for display
      const existingFile = record.orCrFileName ? [{
        uid: '-1',
        name: record.orCrFileName,
        status: 'done',
        url: '#', // You can set actual URL if you have file viewing endpoint
      }] : [];
      
      setFileList(existingFile);
      
      form.setFieldsValue({
        plateNumber: record.plateNumber,
        ownerName: record.owner,
        ownerType: record.ownerType,
        vehicleColor: record.vehicleColor,
        vehicleType: record.vehicleType,
        vehicleModel: record.vehicleModel,
        stickerNumber: record.stickerNumber,
        expirationDate: record.expirationDate ? dayjs(record.expirationDate) : null,
        students: record.students || [{}],
        OrCr: existingFile,
      });
    } else {
      setEditingRecord(null);
      setFileList([]);
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("PlateNumber", values.plateNumber);
      formData.append("OwnerName", values.ownerName);
      formData.append("OwnerType", values.ownerType);
      formData.append("VehicleColor", values.vehicleColor);
      formData.append("VehicleType", values.vehicleType);
      formData.append("StickerNumber", values.stickerNumber);

      if (values.vehicleModel) formData.append("VehicleModel", values.vehicleModel);

      // Add expiration date
      if (values.expirationDate) {
        formData.append("ExpirationDate", values.expirationDate.toISOString());
      }

      if (values.students && values.students.length > 0) {
        formData.append("Students", JSON.stringify(values.students));
      }

      // Handle OR/CR file upload
      // Only append new file if user selected a new one
      if (values.OrCr && values.OrCr.length > 0) {
        const file = values.OrCr[0];
        // Check if this is a new file (has originFileObj) or existing file
        if (file.originFileObj) {
          formData.append("OrCr", file.originFileObj);
        }
        // If editing and no new file, the backend will keep the existing file
      }

      if (editingRecord?.id) {
        await _vehicleRegistrationService.updateAsync(editingRecord.id, formData);
        Toast("Successfully updated");
      } else {
        await _vehicleRegistrationService.insertAsync(formData);
        Toast("Successfully added");
      }

      setIsModalVisible(false);
      setFileList([]);
      form.resetFields();
      refetch();
    } catch (err) {
      console.log(err);
      message.error("Please fill all required fields.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
    form.resetFields();
  };

  const handleDelete = async (id: number) => {
    await _vehicleService.deleteByIdAsync(id);
    refetch();
    Toast("Successfully deleted");
  };

  const showInfo = async (record: VehiclesTbl) => {
    if (!record.id) {
      Toast("Vehicle ID not found");
      return;
    }
    try {
      const fullData = await _vehicleService.getById(record.id);
      setInfoRecord(fullData);
      setInfoModalVisible(true);
    } catch (err) {
      console.log(err);
      Toast("Failed to load vehicle info");
    }
  };

  const handleInfoCancel = () => {
    setInfoModalVisible(false);
    setInfoRecord(null);
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      v.owner?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "Plate Number", dataIndex: "plateNumber", key: "plateNumber" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Vehicle Type", dataIndex: "vehicleType", key: "vehicleType" },
    { title: "Sticker Number", dataIndex: "stickerNumber", key: "stickerNumber" },
    {
      title: "Expiration",
      key: "expiration",
      render: (_: any, record: VehiclesTbl) => {
        const { text, color } = getExpirationStatus(record.expirationDate);
        return <Tag color={color}>{text}</Tag>;
      },
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
              title="Are you sure?"
              onConfirm={() => handleDelete(record.id ?? 0)}
            >
              <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
            </Popconfirm>
          </Tooltip>

          <Tooltip title="Show Info">
            <InfoCircleOutlined
              style={{ color: "#1890ff", cursor: "pointer" }}
              onClick={() => showInfo(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by plate number or owner"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={() => showModal()}>
          Create
        </Button>
      </Space>

      <AntTable columns={columns} dataSource={filteredVehicles} rowKey="id" />

      {/* Create / Update Modal */}
      <Modal
        title={editingRecord ? "Update Vehicle" : "Register Vehicle"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRecord ? "Update" : "Create"}
        width={700}
      >
        <Form form={form} layout="vertical" initialValues={{ students: [{}] }}>
          <Form.Item name="plateNumber" label="Plate Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="ownerName" label="Owner Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="ownerType" label="Owner Type" rules={[{ required: true }]}>
            <Select placeholder="Select owner type">
              <Option value="Student">Student</Option>
              <Option value="Teacher">Teacher</Option>
              <Option value="Parent">Parent</Option>
              <Option value="Staff">Staff</Option>
              <Option value="Visitor">Visitor</Option>
            </Select>
          </Form.Item>

          <Form.Item name="vehicleColor" label="Vehicle Color" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <SelectVehicleType
            name="vehicleType"
            label="Vehicle Type"
            rules={[{ required: true, message: "Please select vehicle type!" }]}
          />

          <Form.Item name="vehicleModel" label="Vehicle Model">
            <Input />
          </Form.Item>

          <Form.Item name="stickerNumber" label="Sticker Number" 
            rules={[{ required: true, message: "Please enter sticker number" }]}>
              <Input placeholder="Enter sticker number" />
          </Form.Item>

          <Form.Item 
            name="expirationDate" 
            label="Registration Expiration Date"
            rules={[{ required: true, message: "Please select expiration date" }]}
          >
            <DatePicker 
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>

          {/* Students Section */}
          <Form.List name="students">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "studentName"]}
                      rules={[{ required: true, message: "Missing student name" }]}
                    >
                      <Input placeholder="Student Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "studentNumber"]}
                      rules={[{ required: true, message: "Missing student number" }]}
                    >
                      <Input placeholder="Student Number" />
                    </Form.Item>
                    <Button danger type="text" onClick={() => remove(name)}>
                      Delete
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Student
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* OR/CR Upload */}
          <Form.Item
            name="OrCr"
            label={
              <span>
                Official Receipt / Certificate of Registration
                {editingRecord && fileList.length > 0 && (
                  <span style={{ color: '#52c41a', marginLeft: 8 }}>
                    (File exists - upload new file to replace)
                  </span>
                )}
              </span>
            }
            valuePropName="fileList"
            getValueFromEvent={(e: any) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            rules={[
              { 
                required: !editingRecord, // Only required for new registration
                message: "Please upload OR/CR file" 
              }
            ]}
          >
            <Dragger 
              beforeUpload={beforeUpload} 
              maxCount={1}
              fileList={fileList}
              onChange={handleFileChange}
              onRemove={() => {
                setFileList([]);
                return true;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                {editingRecord 
                  ? "Click or drag PDF to replace existing file" 
                  : "Click or drag PDF to upload"}
              </p>
              <p className="ant-upload-hint">Only PDF files are accepted. Max size: 10MB.</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Show Full Info Modal */}
      <Modal
        title="Vehicle Information"
        visible={infoModalVisible}
        footer={[
          <Button key="close" onClick={handleInfoCancel}>
            Close
          </Button>,
        ]}
        onCancel={handleInfoCancel}
        width={600}
      >
        {infoRecord ? (
          <div>
            <p>
              <strong>Plate Number:</strong> {infoRecord.plateNumber}
            </p>
            <p>
              <strong>Owner Name:</strong> {infoRecord.owner}
            </p>
            <p>
              <strong>Owner Type:</strong> {infoRecord.ownerType || "-"}
            </p>
            <p>
              <strong>Vehicle Type:</strong> {infoRecord.vehicleType}
            </p>
            <p>
              <strong>Vehicle Model:</strong> {infoRecord.vehicleModel || "-"}
            </p>
            <p>
              <strong>Vehicle Color:</strong> {infoRecord.vehicleColor || "-"}
            </p>
            <p>
              <strong>Sticker Number:</strong> {infoRecord.stickerNumber || "-"}
            </p>
            <p>
              <strong>Expiration Date:</strong>{" "}
              {infoRecord.expirationDate ? dayjs(infoRecord.expirationDate).format("YYYY-MM-DD") : "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Tag color={getExpirationStatus(infoRecord.expirationDate).color}>
                {getExpirationStatus(infoRecord.expirationDate).text}
              </Tag>
            </p>
            <p>
              <strong>Students:</strong>{" "}
              {infoRecord.students?.map((s) => s.studentName).join(", ") || "-"}
            </p>
            {infoRecord.orCrFileName && (
              <p>
                <strong>OR/CR File:</strong> {infoRecord.orCrFileName}
              </p>
            )}
          </div>
        ) : (
          <p>No data available</p>
        )}
      </Modal>
    </div>
  );
}