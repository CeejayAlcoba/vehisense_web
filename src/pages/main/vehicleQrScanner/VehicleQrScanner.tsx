import React, { useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Modal,
  Descriptions,
  Button,
  message,
  Input,
  Form,
  DatePicker,
} from "antd";
import { Scanner } from "@yudiel/react-qr-scanner";
import _vehicleRegistrationService from "../../../services/vehicleRegistrationService";
import { VehicleRegistration } from "../../../types/VehicleRegistration";
import { ReloadOutlined } from "@ant-design/icons";
import _vehicleService from "../../../services/vehicleService";
import { AxiosError } from "axios";
import dayjs from "dayjs";

const VehicleQrScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleRegistration | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleScan = async (qrId: string) => {
    if (!qrId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await _vehicleRegistrationService.GetById(Number(qrId));
      setVehicle(data);

      if (data.orCrFileName) {
        const blob = await _vehicleRegistrationService.GetOrCr(Number(qrId));
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsModalVisible(true);
      } else {
        setError("This vehicle has no OR/CR file uploaded.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setVehicle(null);
    setPdfUrl(null);
    setIsModalVisible(false);
    setScannerKey((prev) => prev + 1);
  };

  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await _vehicleRegistrationService.UpdatePatch(vehicle?.id??0,{
        ...vehicle,
        stickerNumber:values.stickerNumber, 
        expirationDate:values.expirationDate? dayjs(values.expirationDate).format("YYYY-MM-DD") :""
      })

      await _vehicleService.insertAsync({
        plateNumber: vehicle?.plateNumber ?? "",
        owner: vehicle?.ownerName ?? "",
        ownerType: vehicle?.ownerType ?? "",
        vehicleType: vehicle?.vehicleType ?? "",
        vehicleModel: vehicle?.vehicleModel ?? "",
        vehicleColor: vehicle?.vehicleColor ?? "",
        stickerNumber: values.stickerNumber,
        registrationDate: dayjs().toISOString(),
        expirationDate: values.expirationDate.toISOString(),
      });

      message.success("Vehicle successfully approved and registered!");
      setIsApproveModalVisible(false);
      handleCloseModal();
      form.resetFields();
    } catch (e: any) {
      if (e.errorFields) {
        message.error("Please fill in all required fields");
        return;
      }
      const ex: AxiosError = e;
      message.error((ex.response?.data as string) || "Request failed");
    }
  };

  const handleApproveClick = async () => {
    form.resetFields();
    try {
      // Fetch the next sticker number
      const stickerNum = await _vehicleRegistrationService.getNextStickerNumber();
      form.setFieldValue("stickerNumber", stickerNum);
    } catch (error) {
      message.error("Failed to generate sticker number");
    }
    setIsApproveModalVisible(true);
  };

  return (
    <Card title="Vehicle OR/CR Scanner" className="shadow-lg rounded-xl">
      {!isModalVisible && (
        <Scanner
          key={scannerKey}
          onScan={(result) => {
            if (result && result[0]?.rawValue) {
              const id = result[0].rawValue.split("-")[0];
              handleScan(id);
            }
          }}
          onError={(err: any) => setError("QR Scan failed: " + err.message)}
          components={{ finder: true }}
          styles={{ container: { width: "300px", borderRadius: "12px" } }}
        />
      )}

      {loading && <Spin tip="Loading data..." style={{ marginTop: 16 }} />}

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginTop: 16 }}
          action={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              size="small"
              style={{ borderRadius: 6 }}
              onClick={() => {
                setScannerKey((prev) => prev + 1);
                setError(null);
              }}
            >
              Scan Again
            </Button>
          }
        />
      )}

      <Modal
        open={isModalVisible}
        title="Vehicle Information"
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button
            key="open"
            type="primary"
            onClick={() => handleApproveClick()}
          >
            Approve
          </Button>,
        ]}
        width="80%"
      >
        {vehicle && (
          <Descriptions bordered column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Plate Number">
              {vehicle.plateNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Owner Name">
              {vehicle.ownerName}
            </Descriptions.Item>
            <Descriptions.Item label="Owner Type">
              {vehicle.ownerType}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Color">
              {vehicle.vehicleColor}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Type">
              {vehicle.vehicleType}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Model">
              {vehicle.vehicleModel || "N/A"}
            </Descriptions.Item>
            {vehicle.students && vehicle.students.length > 0 && (
              <Descriptions.Item label="Students">
                {vehicle.students.map((s, idx) => (
                  <div key={idx}>
                    {s.studentName} ({s.studentNumber})
                  </div>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
        {pdfUrl && (
          <div style={{ marginTop: 16 }}>
            <h4>OR/CR Document:</h4>
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              style={{ border: "1px solid #d9d9d9", borderRadius: 8 }}
              title="Vehicle OR/CR PDF"
            />
          </div>
        )}
      </Modal>

      <Modal
        open={isApproveModalVisible}
        title="Approve Vehicle Registration"
        onCancel={() => {
          setIsApproveModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsApproveModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={handleApprove}>
            Approve & Register
          </Button>,
        ]}
        width={500}
      >
        <p style={{ marginBottom: 16, color: "#595959" }}>
          Please assign a sticker number and set the expiration date for this vehicle:
        </p>

        {vehicle && (
          <div
            style={{
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>Vehicle:</strong> {vehicle.plateNumber}
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>Owner:</strong> {vehicle.ownerName}
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              <strong>Type:</strong> {vehicle.vehicleType}
            </p>
          </div>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            label="Sticker Number (Auto-generated)"
            name="stickerNumber"
            rules={[{ required: true, message: "Sticker number is required" }]}
          >
            <Input disabled placeholder="Auto-generated sticker number" />
          </Form.Item>

          <Form.Item
            label="Registration Expiration Date"
            name="expirationDate"
            rules={[{ required: true, message: "Please select expiration date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
              placeholder="Select expiration date"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VehicleQrScanner;