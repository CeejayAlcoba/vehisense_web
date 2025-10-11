import { Bar } from "@ant-design/charts";
import { Card, Input, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import _vehicleLogsService from "../../../../services/vehicleLogsService";
import { REFETCH_INTERVAL } from "../../../../configs/request.config";
import { VehicleLogsDateRange } from "../../../../types/VehicleLogs";
import { useState, useMemo } from "react";

export default function TodayTotalLogsGraph(props: VehicleLogsDateRange) {
  const [searchText, setSearchText] = useState("");

  // 🔹 Fetch the total logs by type
  const { data: typeCount = [] } = useQuery({
    queryKey: ["typeCount", props.dateFrom, props.dateTo],
    queryFn: async () => {
      const res = await _vehicleLogsService.CountByType(props);
      return res?.map((c) => ({ type: c.vehicleType, value: c.total })) ?? [];
    },
    initialData: [],
    refetchInterval: REFETCH_INTERVAL,
  });

  // 🔹 Filter data based on search text
  const filteredData = useMemo(() => {
    const lower = searchText.toLowerCase();
    return typeCount.filter((item) =>
      item.type.toLowerCase().includes(lower)
    );
  }, [searchText, typeCount]);

  // 🔹 Sort alphabetically (optional, for cleaner order)
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
      title={`Total (${total})`}
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
