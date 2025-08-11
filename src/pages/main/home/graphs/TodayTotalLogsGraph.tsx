import { Bar } from "@ant-design/charts";
import { Card } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getCurrentDateYMD } from "../../../../utils/dateTimeUtility";
import _vehicleLogsService from "../../../../services/VehicleLogsService";
import { REFETCH_INTERVAL } from "../../../../configs/request.config";
import { VehicleLogsDateRange } from "../../../../types/VehicleLogs";

export default function TodayTotalLogsGraph(props:VehicleLogsDateRange ) {
  const { data: typeCount } = useQuery({
    queryKey: ["typeCount",props.dateFrom,props.dateTo],
    queryFn: async () => {
      const res = await _vehicleLogsService.CountByType(props);
      return res?.map((c) => ({ type: c.vehicleType, value: c.total }));
    },
    initialData: [],
    refetchInterval: REFETCH_INTERVAL,
  });
  const config = {
    data: typeCount,
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
    onReady: ({ chart, ...rest }: any) => {
      chart.on(
        "afterrender",
        () => {
          const { document } = chart.getContext().canvas;
          const elements = document.getElementsByClassName("element");
          elements[0]?.emit("click");
        },
        true
      );
    },
  };
  const total = typeCount.reduce((curr, val) => (curr += val.value), 0);
  return (
    <Card title={`Total (${total})`}>
      <Bar {...config} />
    </Card>
  );
}
