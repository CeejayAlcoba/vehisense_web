import React, { useEffect, useState } from "react";
import { Card, Badge, Space, Statistic, Typography } from "antd";
import { CameraOutlined, CarOutlined, SyncOutlined } from "@ant-design/icons";
import _detectionStatusService from "../../services/detectionStatusService";
import { DetectionStatus } from "../../types/DetectionStatus";

const { Text } = Typography;

const StatusWidget: React.FC = () => {
  const [status, setStatus] = useState<DetectionStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const currentStatus = await _detectionStatusService.getCurrentStatus();
        const runningStatus = await _detectionStatusService.isSystemRunning();
        setStatus(currentStatus);
        setIsRunning(runningStatus.isRunning);
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getBadgeStatus = () => {
    if (!status || !isRunning) return "default";
    if (status.status === "running") return "success";
    if (status.status === "error") return "error";
    if (status.status === "starting") return "processing";
    return "default";
  };

  const getStatusText = () => {
    if (!status) return "Unknown";
    if (!isRunning) return "Offline";
    return status.status === "running" ? "Online" : status.status.charAt(0).toUpperCase() + status.status.slice(1);
  };

  return (
    <Card 
      loading={loading}
      hoverable
      style={{ height: '100%' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CameraOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <Text strong>Detection System</Text>
          </Space>
          <Badge status={getBadgeStatus()} text={getStatusText()} />
        </div>

        <Statistic
          title="Detections Today"
          value={status?.detectionsToday || 0}
          prefix={<CarOutlined />}
          valueStyle={{ color: '#3f8600', fontSize: 32 }}
        />

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Camera:</Text>
              <Text strong style={{ color: status?.cameraConnected ? '#3f8600' : '#cf1322' }}>
                {status?.cameraConnected ? "Connected" : "Disconnected"}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Active Vehicles:</Text>
              <Text strong>{status?.activeVehicles || 0}</Text>
            </div>
            {status?.lastPlate && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Last Plate:</Text>
                <Text strong code>{status.lastPlate}</Text>
              </div>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default StatusWidget;
