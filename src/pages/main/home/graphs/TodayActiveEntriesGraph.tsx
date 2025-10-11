import { Bar } from "@ant-design/charts";
import { Card, Input, Select, Space } from "antd";
import _vehicleLogsService from "../../../../services/VehicleLogsService";
import { useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "../../../../configs/request.config";
import { VehicleLogsDateRange } from "../../../../types/VehicleLogs";
import { useState, useMemo } from "react";

export default function TodayActiveEntriesGraph(props: VehicleLogsDateRange) {
  const [searchText, setSearchText] = useState("");

  // 🔹 Fetch data
  const { data: typeCount = [] } = useQuery({
    queryKey: ["activeEntries", props],
    queryFn: async () => {
      const res = await _vehicleLogsService.GetActiveEntriesByType(props);
      return res?.map((c) => ({ type: c.vehicleType, value: c.total })) ?? [];
    },
    initialData: [],
    refetchInterval: REFETCH_INTERVAL,
  });

  // 🔹 Filter data (search by vehicle type)
  const filteredData = useMemo(() => {
    const lower = searchText.toLowerCase();
    return typeCount.filter((item) => item.type.toLowerCase().includes(lower));
  }, [searchText, typeCount]);

  // 🔹 Sort alphabetically (optional)
  const sortedData = useMemo(
    () => [...filteredData].sort((a, b) => a.type.localeCompare(b.type)),
    [filteredData]
  );

  // 🔹 Chart config
  const config = {
    data: sortedData,
    height: 400,
    xField: "type",
    yField: "value",
    colorField: "type",
    state: {
      unselected: { opacity: 0.5 },
      selected: { lineWidth: 3, stroke: "red" },
    },
    interaction: {
      elementSelect: true,
    },
  };

  const total = sortedData.reduce((curr, val) => curr + val.value, 0);

  return (
    <Card
      title={`Active Entries (${total})`}
      extra={
        <Space>
          <Input
            placeholder="Search vehicle type..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
        </Space>
      }
    >
      <Bar {...config} />
    </Card>
  );
}
