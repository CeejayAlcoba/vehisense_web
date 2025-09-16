import { Badge, Card, Col, Row } from "antd";

export default function MonitoringColorLegend() {
  return (
    <div
    className="mb-2"
    >
      <Card style={{ width: "200px" }}>
        <Row gutter={10}>
          <Col span={20}>
            <Badge color="red" count="UNREGISTERED" />
          </Col>
          <Col span={24}>
            <Badge color="black" count="REGISTERED" />
          </Col>
           <Col span={24}>
            <Badge color="yellow" count="WARNING" />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
