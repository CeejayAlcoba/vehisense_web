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
import { VehicleRegistration } from "../../../types/VehicleRegistration";

const { Option } = Select;
const { Dragger } = Upload;

export default function VehicleManagementPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] =
    useState<VehicleRegistration | null>(null);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoRecord, setInfoRecord] = useState<VehicleRegistration | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { data: vehicles, refetch } = useQuery({
    queryKey: ["vehicles-list"],
    queryFn: async () => await _vehicleRegistrationService.getAllAsync(),
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
    if (!expirationDate)
      return { status: "none", text: "No Expiry", color: "default" };

    const expiry = dayjs(expirationDate);
    const today = dayjs();
    const daysUntilExpiry = expiry.diff(today, "day");

    if (daysUntilExpiry < 0) {
      return { status: "expired", text: "Expired", color: "red" };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "expiring",
        text: `Expires in ${daysUntilExpiry} days`,
        color: "orange",
      };
    } else {
      return { status: "valid", text: "Valid", color: "green" };
    }
  };

  const showModal = async (record?: VehicleRegistration) => {
    setIsModalVisible(true);
    if (record?.id) {
      setEditingRecord(record);
      const reg = await _vehicleRegistrationService.GetById(record.id);
      form.setFieldsValue({
        ...reg,
        expirationDate: reg?.expirationDate
          ? dayjs(reg?.expirationDate, "YYYY-MM-DD")
          : "",
      });
      try {
        const blob = await _vehicleRegistrationService.GetOrCr(
          Number(record.id)
        );
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch {
        setPdfUrl("");
      }
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
      formData.append("Id", values.id);
      formData.append("PlateNumber", values.plateNumber);
      formData.append("OwnerName", values.ownerName);
      formData.append("OwnerType", values.ownerType);
      formData.append("VehicleColor", values.vehicleColor);
      formData.append("VehicleType", values.vehicleType);
      formData.append("StickerNumber", values.stickerNumber);
      formData.append("OrCrFileName", editingRecord?.orCrFileName??"");
      if (values.vehicleModel)
        formData.append("VehicleModel", values.vehicleModel);

      // Add expiration date
      if (values.expirationDate) {
        formData.append("ExpirationDate", values.expirationDate.toISOString());
      }

      if (values.students && values.students.length > 0) {
        formData.append("Students", JSON.stringify(values.students));
      }
      if (values.OrCr && values.OrCr.length > 0) {
        const file = values.OrCr[0];
        if (file.originFileObj) {
          formData.append("OrCr", file.originFileObj);
        }
      }

      if (editingRecord?.id) {
        await _vehicleRegistrationService.updateAsync(
          editingRecord.id,
          formData
        );
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

  const showInfo = async (record: VehicleRegistration) => {
    console.log(record);
    if (!record.id) {
      Toast("Vehicle ID not found");
      return;
    }
    try {
      const reg = await _vehicleRegistrationService.GetById(record.id);
      setInfoRecord(reg);
      if (record.orCrFileName) {
        try {
          const blob = await _vehicleRegistrationService.GetOrCr(
            Number(record.id)
          );
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch {
          setPdfUrl("");
        }
      }
      setInfoModalVisible(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleInfoCancel = () => {
    setInfoModalVisible(false);
    setInfoRecord(null);
  };

  const columns = [
    { title: "Plate Number", dataIndex: "plateNumber", key: "plateNumber" },
    { title: "Owner", dataIndex: "ownerName", key: "ownerName" },
    { title: "Vehicle Type", dataIndex: "vehicleType", key: "vehicleType" },
    {
      title: "Sticker Number",
      dataIndex: "stickerNumber",
      key: "stickerNumber",
    },
    {
      title: "Expiration",
      key: "expirationDate",
      render: (_: any, record: VehicleRegistration) => {
        const { text, color } = getExpirationStatus(record.expirationDate);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: VehicleRegistration) => (
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

      <AntTable columns={columns} dataSource={vehicles} rowKey="id" />

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
          <Form.Item className="d-none" name="id" label="Id">
            <Input />
          </Form.Item>
          <Form.Item
            name="plateNumber"
            label="Plate Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ownerName"
            label="Owner Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ownerType"
            label="Owner Type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select owner type">
              <Option value="Student">Student</Option>
              <Option value="Teacher">Teacher</Option>
              <Option value="Parent">Parent</Option>
              <Option value="Staff">Staff</Option>
              <Option value="Visitor">Visitor</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vehicleColor"
            label="Vehicle Color"
            rules={[{ required: true }]}
          >
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

          <Form.Item
            name="stickerNumber"
            label="Sticker Number"
            rules={[{ required: true, message: "Please enter sticker number" }]}
          >
            <Input placeholder="Enter sticker number" />
          </Form.Item>

          <Form.Item
            name="expirationDate"
            label="Registration Expiration Date"
            rules={[
              { required: true, message: "Please select expiration date" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          {/* Students Section */}
          <Form.List name="students">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "studentName"]}
                      rules={[
                        { required: true, message: "Missing student name" },
                      ]}
                    >
                      <Input placeholder="Student Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "studentNumber"]}
                      rules={[
                        { required: true, message: "Missing student number" },
                      ]}
                    >
                      <Input placeholder="Student Number" />
                    </Form.Item>
                    <Button danger type="text" onClick={() => remove(name)}>
                      Delete
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Student
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* OR/CR Upload */}

          <Form.Item
            label="Official Receipt / Certificate of Registration (OR/CR)"
            name="OrCr"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Dragger beforeUpload={ (file: RcFile) =>{
              beforeUpload(file)
              setPdfUrl("")
            }} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag PDF to upload</p>
              <p className="ant-upload-hint">
                Only <b>PDF</b> files are accepted. Max size: <b>10MB</b>.
              </p>
            </Dragger>
          </Form.Item>

          {pdfUrl && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="400px"
                style={{ borderRadius: 8, border: "1px solid #d9d9d9" }}
              />
              <p style={{ marginTop: 8 }}>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  View PDF in new tab
                </a>
              </p>
            </div>
          )}
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
        width={800}
      >
        {infoRecord ? (
          <div>
            <p>
              <strong>Plate Number:</strong> {infoRecord.plateNumber}
            </p>
            <p>
              <strong>Owner Name:</strong> {infoRecord.ownerName}
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
              {infoRecord.expirationDate
                ? dayjs(infoRecord.expirationDate).format("YYYY-MM-DD")
                : "-"}
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
            {pdfUrl && (
              <div style={{ marginTop: 16 }}>
                <h6>OR/CR Document:</h6>
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="600px"
                  style={{ border: "1px solid #d9d9d9", borderRadius: 8 }}
                  title="Vehicle OR/CR PDF"
                />
              </div>
            )}
          </div>
        ) : (
          <p>No data available</p>
        )}
      </Modal>
    </div>
  );
}
