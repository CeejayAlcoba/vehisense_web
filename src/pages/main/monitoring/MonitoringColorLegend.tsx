import { Badge, Card, Col, Row } from "antd";

export default function MonitoringColorLegend() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Card title="Color Legend" style={{ width: "200px" }}>
        <Row gutter={16}>
          <Col span={24}>
            <Badge color="red" count="UNREGISTERED" />
          </Col>
          <Col span={24}>
            <Badge color="black" count="REGISTERED" />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
