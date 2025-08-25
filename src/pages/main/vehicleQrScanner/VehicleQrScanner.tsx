import React, { useState } from "react";
import { Card, Spin, Alert, Modal, Descriptions, Button } from "antd";
import { Scanner } from "@yudiel/react-qr-scanner";
import _vehicleRegistrationService from "../../../services/vehicleRegistrationService";
import { VehicleRegistration } from "../../../types/VehicleRegistration";
import { ReloadOutlined } from "@ant-design/icons";

const VehicleQrScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleRegistration | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

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
        title="Vehicle"
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button key="open" type="primary" onClick={() => {}}>
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
            <Descriptions.Item label="Vehicle Color">
              {vehicle.vehicleColor}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Type">
              {vehicle.vehicleType}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Model">
              {vehicle.vehicleModel}
            </Descriptions.Item>
          </Descriptions>
        )}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Vehicle OR/CR PDF"
          />
        )}
      </Modal>
    </Card>
  );
};

export default VehicleQrScanner;
