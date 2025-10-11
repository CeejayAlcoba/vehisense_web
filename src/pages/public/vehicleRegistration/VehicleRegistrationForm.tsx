import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
  Space,
  Card,
  Typography,
  Modal,
  QRCode,
  Table,
  Tabs,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { VehicleRegistration } from "../../../types/VehicleRegistration";
import _vehicleRegistrationService from "../../../services/vehicleRegistrationService";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { indexDbService } from "../../../services/indexDBService";

const { Option } = Select;
const { Dragger } = Upload;
const { Title } = Typography;

const VehicleRegistrationForm: React.FC = () => {
  const [form] = Form.useForm();
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");
  const [vehicles, setVehicles] = useState<VehicleRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    handleRetriveQr();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await _vehicleRegistrationService.getAllAsync();
      setVehicles(data);
    } catch (error: any) {
      message.error(error?.message || "Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleRetriveQr = async () => {
    const data = await indexDbService.getItem("vehicleRegistration", 1);
    if (data) {
      setQrValue(
        `${data?.registration.id}-${data?.registration.plateNumber}-${data?.registration.ownerName}`
      );
      setQrVisible(true);
    }
  };

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
    return true;
  };

  const handleFinish = async (values: VehicleRegistration & { OrCr: any }) => {
    try {
      const formData = new FormData();

      formData.append("PlateNumber", values.plateNumber);
      formData.append("OwnerName", values.ownerName);
      formData.append("OwnerType", values.ownerType);
      formData.append("VehicleColor", values.vehicleColor);
      formData.append("VehicleType", values.vehicleType);

      if (values.vehicleModel) {
        formData.append("VehicleModel", values.vehicleModel.toString());
      }

      if (values.students && values.students.length > 0) {
        formData.append("Students", JSON.stringify(values.students));
      }

      if (values.OrCr && values.OrCr[0]?.originFileObj) {
        formData.append("OrCr", values.OrCr[0].originFileObj);
      }

      const newReg: VehicleRegistration =
        await _vehicleRegistrationService.insertAsync(formData);

      message.success("Vehicle registered successfully!");
      form.resetFields();
      
      // Refresh the vehicle list
      await fetchVehicles();
      
      const qrData = `${newReg.id}-${newReg.plateNumber}-${newReg.ownerName}`;
      setQrValue(qrData);
      setQrVisible(true);
      await indexDbService.addItem("vehicleRegistration", {
        registration: newReg,
        id: 1,
      });
    } catch (ex: any) {
      message.error(ex?.response?.data?.message || "Something went wrong!");
    }
  };

  const handleDownloadPDF = async () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) {
      message.error("QR Code not found!");
      return;
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("Vehicle Registration - Vehisense", 10, 15);
    pdf.setFontSize(12);
    pdf.text(`Date: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 10, 25);

    pdf.addImage(imgData, "PNG", 10, 40, 60, 60);
    pdf.save(`vehisense-registration-qr.pdf`);

    await indexDbService.deleteItem("vehicleRegistration", 1);
    setQrVisible(false);
    
    // Switch to list tab
    setActiveTab("2");
  };

  const handleModalClose = async () => {
    await indexDbService.deleteItem("vehicleRegistration", 1);
    setQrVisible(false);
    // Switch to list tab
    setActiveTab("2");
  };

  const handleViewOrCr = async (id: number) => {
    try {
      const blob = await _vehicleRegistrationService.GetOrCr(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error: any) {
      message.error("Failed to load OR/CR document");
    }
  };

  const columns: ColumnsType<VehicleRegistration> = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Owner Name",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Owner Type",
      dataIndex: "ownerType",
      key: "ownerType",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
    },
    {
      title: "Vehicle Color",
      dataIndex: "vehicleColor",
      key: "vehicleColor",
    },
    {
      title: "Vehicle Model",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
    },
    {
      title: "Registration Date",
      dataIndex: "registrationDate",
      key: "registrationDate",
      render: (value?: string) =>
        value ? dayjs(value).format("YYYY-MM-DD") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewOrCr(record.id!)}
          >
            View OR/CR
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Vehicle Registration
        </Title>
      }
      bordered={false}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      bodyStyle={{ padding: "24px 32px" }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Register Vehicle" key="1">
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ ownerType: "Student", students: [{}] }}
            >
              <Form.Item
                label="Plate Number"
                name="plateNumber"
                rules={[
                  { required: true, message: "Please enter plate number" },
                ]}
              >
                <Input placeholder="Enter plate number" />
              </Form.Item>

              <Form.Item
                label="Owner Name"
                name="ownerName"
                rules={[
                  { required: true, message: "Please enter owner name" },
                ]}
              >
                <Input placeholder="Enter owner name" />
              </Form.Item>

              <Form.Item
                label="Owner Type"
                name="ownerType"
                rules={[
                  { required: true, message: "Please select owner type" },
                ]}
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
                label="Vehicle Color"
                name="vehicleColor"
                rules={[
                  { required: true, message: "Please enter vehicle color" },
                ]}
              >
                <Input placeholder="Enter vehicle color" />
              </Form.Item>

              <Form.Item
                label="Vehicle Type"
                name="vehicleType"
                rules={[
                  { required: true, message: "Please select vehicle type" },
                ]}
              >
                <Select placeholder="Select vehicle type">
                  <Option value="Car">Car</Option>
                  <Option value="Motorcycle">Motorcycle</Option>
                  <Option value="SUV">SUV</Option>
                  <Option value="Truck">Truck</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Vehicle Model" name="vehicleModel">
                <Input placeholder="Enter vehicle model" />
              </Form.Item>

              <Form.List name="students">
                {(fields, { add, remove }) => (
                  <>
                    <label className="ant-form-item-required">Students</label>
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
                            {
                              required: true,
                              message: "Missing student number",
                            },
                          ]}
                        >
                          <Input placeholder="Student Number" />
                        </Form.Item>
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
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

              <Form.Item
                label="Official Receipt / Certificate of Registration (OR/CR)"
                name="OrCr"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                rules={[
                  { required: true, message: "Please upload OR/CR file" },
                ]}
              >
                <Dragger beforeUpload={beforeUpload} maxCount={1}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag PDF to upload</p>
                  <p className="ant-upload-hint">
                    Only <b>PDF</b> files are accepted. Max size: <b>10MB</b>.
                  </p>
                </Dragger>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Register Vehicle
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Vehicle List" key="2">
          <Table
            dataSource={vehicles}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        open={qrVisible}
        onCancel={handleModalClose}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <h3>Your Vehicle Registration QR</h3>
          <p style={{ marginBottom: 20, color: "rgba(0,0,0,0.65)" }}>
            Please download this QR code and present it to the school registrar
            for verification.
          </p>

          <div
            ref={qrRef}
            style={{
              display: "inline-block",
              padding: 10,
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            <QRCode value={qrValue} size={120} />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default VehicleRegistrationForm;