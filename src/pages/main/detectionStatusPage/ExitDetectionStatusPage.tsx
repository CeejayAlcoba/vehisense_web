import React, { useEffect, useState, useRef } from "react";
import { 
  Card, 
  Badge, 
  Table, 
  Switch, 
  Button, 
  Space, 
  Statistic, 
  Row, 
  Col, 
  Tag,
  Typography,
  Alert,
  Spin,
  notification
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CameraOutlined,
  CarOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import _detectionStatusService from "../../../services/detectionStatusService";
import { DetectionStatus, DetectionLog } from "../../../types/DetectionStatus";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

type StatusType = 'running' | 'error' | 'stopped' | 'starting';

const ExitDetectionStatusPage: React.FC = () => {
  const [status, setStatus] = useState<DetectionStatus | null>(null);
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [api, contextHolder] = notification.useNotification();
  
  const lastNotifiedStatus = useRef<string>('');
  const notificationCooldown = useRef<boolean>(false);

  const fetchStatus = async () => {
    try {
      const currentStatus = await _detectionStatusService.getExitCurrentStatus();
      
      if (status && 
          currentStatus.status && 
          status.status !== currentStatus.status && 
          lastNotifiedStatus.current !== currentStatus.status &&
          !notificationCooldown.current) {
        
        const statusChange: Record<StatusType, { message: string; type: 'success' | 'error' | 'warning' | 'info'; icon: React.ReactNode }> = {
          running: { message: 'EXIT System Online', type: 'success', icon: <CheckCircleOutlined /> },
          error: { message: 'EXIT System Error', type: 'error', icon: <CloseCircleOutlined /> },
          stopped: { message: 'EXIT System Stopped', type: 'warning', icon: <WarningOutlined /> },
          starting: { message: 'EXIT System Starting', type: 'info', icon: <SyncOutlined /> },
        };
        
        const statusKey = currentStatus.status as StatusType;
        const config = statusChange[statusKey];
        
        if (config) {
          api[config.type]({
            message: config.message,
            description: currentStatus.message || 'Status changed',
            icon: config.icon,
            placement: 'topRight',
            duration: 4.5
          });
          
          lastNotifiedStatus.current = currentStatus.status;
          notificationCooldown.current = true;
          setTimeout(() => { notificationCooldown.current = false; }, 10000);
        }
      }
      
      setStatus(currentStatus);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching EXIT status:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const recentLogs = await _detectionStatusService.getRecentLogs(50);
      setLogs(recentLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchLogs()]);
      setLoading(false);
    };

    loadData();

    const interval = autoRefresh ? setInterval(() => { fetchStatus(); fetchLogs(); }, 5000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  const getStatusBadge = (statusValue: string) => {
    const badges: Record<string, { status: "success" | "error" | "processing" | "default"; text: string }> = {
      running: { status: "success", text: "Running" },
      error: { status: "error", text: "Error" },
      starting: { status: "processing", text: "Starting" },
      stopped: { status: "default", text: "Stopped" },
      unknown: { status: "default", text: "Unknown" }
    };
    return badges[statusValue] || badges.unknown;
  };

  const getLogTag = (level: string) => {
    const tags: Record<string, { color: string; label: string }> = {
      ERROR: { color: "error", label: "ERROR" },
      WARNING: { color: "warning", label: "WARNING" },
      INFO: { color: "processing", label: "INFO" }
    };
    return tags[level] || tags.INFO;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const columns: ColumnsType<DetectionLog> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => <Text type="secondary">{dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>,
    },
    {
      title: 'Level',
      dataIndex: 'logLevel',
      key: 'logLevel',
      width: 100,
      render: (level: string) => {
        const tag = getLogTag(level);
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading EXIT system status..." />
      </div>
    );
  }

  const badgeConfig = status ? getStatusBadge(status.status) : getStatusBadge("unknown");

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}
      
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <LogoutOutlined style={{ color: '#ff4d4f' }} /> Vehicle EXIT Detection System
          </Title>
          <Text type="secondary">Last updated: {dayjs(lastUpdated).fromNow()}</Text>
        </Col>
        <Col>
          <Space>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} checkedChildren="Auto" unCheckedChildren="Manual" />
            <Button icon={<ReloadOutlined />} onClick={() => { fetchStatus(); fetchLogs(); }} type="primary" danger>
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      {status && (
        <Alert
          message={<Space><Badge status={badgeConfig.status} /><strong>EXIT System Status: {badgeConfig.text.toUpperCase()}</strong></Space>}
          description={status.message || 'No additional information'}
          type={status.status === "running" ? "success" : status.status === "error" ? "error" : status.status === "starting" ? "info" : "warning"}
          showIcon
          style={{ marginBottom: 24, fontSize: 16 }}
          icon={status.status === "running" ? <CheckCircleOutlined /> : status.status === "error" ? <CloseCircleOutlined /> : status.status === "starting" ? <SyncOutlined spin /> : <WarningOutlined />}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic title="EXIT Camera Status" value={status?.cameraConnected ? "Connected" : "Disconnected"} valueStyle={{ color: status?.cameraConnected ? '#3f8600' : '#cf1322', fontSize: 20 }} prefix={<CameraOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic title="EXITS Today" value={status?.detectionsToday || 0} valueStyle={{ color: '#ff4d4f' }} prefix={<LogoutOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic title="Vehicles Inside" value={status?.activeVehicles || 0} valueStyle={{ color: '#722ed1' }} prefix={<CarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic title="System Uptime" value={status ? formatUptime(status.uptimeSeconds) : "0h 0m 0s"} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {status?.lastPlate && (
        <Card title="Last Vehicle EXIT" style={{ marginBottom: 24, borderLeft: '4px solid #ff4d4f' }}>
          <Row gutter={16} align="middle">
            <Col>
              <div style={{ background: '#ff4d4f', color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: 2 }}>
                {status.lastPlate}
              </div>
            </Col>
            <Col>
              <Text type="secondary">Exited: {dayjs(status.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </Col>
          </Row>
        </Card>
      )}

      <Card title="EXIT System Details" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}><Text strong>Status:</Text><br /><Badge status={badgeConfig.status} text={badgeConfig.text} /></Col>
          <Col span={12}><Text strong>Camera:</Text><br /><Badge status={status?.cameraConnected ? "success" : "error"} text={status?.cameraConnected ? "Connected" : "Disconnected"} /></Col>
          <Col span={12}><Text strong>Last Update:</Text><br /><Text>{status ? dayjs(status.timestamp).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</Text></Col>
          <Col span={12}><Text strong>Message:</Text><br /><Text>{status?.message || 'No message'}</Text></Col>
        </Row>
      </Card>

      <Card title="Recent EXIT System Logs">
        <Table columns={columns} dataSource={logs} rowKey={(record) => record.id || `log-${Math.random()}`} pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} logs` }} scroll={{ x: 800 }} size="small" />
      </Card>
    </div>
  );
};

export default ExitDetectionStatusPage;