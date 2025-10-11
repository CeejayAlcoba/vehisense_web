import React, { useEffect, useState } from "react";
import { Card, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import WarningListPage from "../warning/WarningPage";
import BlacklistedVehiclePage from "../blacklistedVehicle/BlacklistedVehiclePage";

const { Option } = Select;

const WarningAndBlacklistPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedView, setSelectedView] = useState<string>("warning");

  // Only use the tab param to select view
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "blacklist" || tab === "warning") {
      setSelectedView(tab);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: 20 }}>
      {/* Header Selector */}
      <Card style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 10 }}>Select View</h2>
        <Select
          value={selectedView}
          onChange={(value) => setSelectedView(value)}
          style={{ width: 250 }}
        >
          <Option value="warning">Warning List</Option>
          <Option value="blacklist">Blacklisted Vehicles</Option>
        </Select>
      </Card>

      {/* Render the selected component */}
      <Card>
        {selectedView === "warning" && <WarningListPage />}
        {selectedView === "blacklist" && <BlacklistedVehiclePage />}
      </Card>
    </div>
  );
};

export default WarningAndBlacklistPage;
