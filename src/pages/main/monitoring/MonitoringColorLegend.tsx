import { Badge, Card, Col, Row } from "antd";

export default function MonitoringColorLegend() {
  return (
    <div className="mb-2 d-flex gap-2">
      <Badge color="red" count="UNREGISTERED" />
      <Badge color="black" count="REGISTERED" />
      <Badge color="yellow" count="WARNING" />
    </div>
  );
}
