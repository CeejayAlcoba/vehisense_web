import { Bar } from "@ant-design/charts";
import { Card } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getCurrentDateYMD } from "../../../../utils/dateTimeUtility";
import _vehicleLogsService from "../../../../services/VehicleLogsService";

export default function TodayTotalLogsGraph() {
  const { data: typeCount } = useQuery({
    queryKey: ["typeCount"],
    queryFn: async () => {
      const res = await _vehicleLogsService.CountByType({
        dateFrom: getCurrentDateYMD(),
      });
      return res?.map((c) => ({ type: c.vehicleType, value: c.total }));
    },
    initialData: [],
    refetchInterval: 3000,
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
    <Card title={`Total Today (${total})`}>
      <Bar {...config} />
    </Card>
  );
}
