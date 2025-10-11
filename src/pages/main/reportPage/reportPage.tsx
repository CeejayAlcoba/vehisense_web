import React, { useState } from "react";
import { Card, Select } from "antd";
import VehicleLogsReport from "../report/VehicleLogsReport";
import AuditLogsPage from "../auditLogs/AuditLogsPage";

const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>("vehicle");

  return (
    <div style={{ padding: 20 }}>
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 10 }}>Select Report Type</h2>
        <Select
          value={selectedReport}
          onChange={(value) => setSelectedReport(value)}
          style={{ width: 250 }}
        >
          <Option value="vehicle">Vehicle Logs Report</Option>
          <Option value="audit">Audit Logs Report</Option>
        </Select>
      </Card>

      <Card>
        {selectedReport === "vehicle" && <VehicleLogsReport />}
        {selectedReport === "audit" && <AuditLogsPage />}
      </Card>
    </div>
  );
};

export default ReportsPage;
