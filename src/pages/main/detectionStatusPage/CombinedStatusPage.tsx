import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Badge, Space, Button } from "antd";
import { LoginOutlined, LogoutOutlined, ReloadOutlined } from "@ant-design/icons";
import StatusWidget from "../../../components/statusWidget/StatusWidget";
import ExitStatusWidget from "../../../components/statusWidget/ExitStatusWidget";

const { Title } = Typography;

const CombinedStatusPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Detection Systems Overview</Title>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} type="primary">
            Refresh All
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <StatusWidget />
        </Col>
        <Col xs={24} md={12}>
          <ExitStatusWidget />
        </Col>
      </Row>
    </div>
  );
};

export default CombinedStatusPage;