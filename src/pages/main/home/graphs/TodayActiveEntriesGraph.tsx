import { Bar } from "@ant-design/charts";
import { Card } from "antd";
import _vehicleLogsService from "../../../../services/VehicleLogsService";
import { useQuery } from "@tanstack/react-query";
import { getCurrentDateYMD } from "../../../../utils/dateTimeUtility";
import { REFETCH_INTERVAL } from "../../../../configs/request.config";

export default function TodayActiveEntriesGraph(){
  const {data:typeCount}=useQuery({
    queryKey:["activeEntries"],
    queryFn: async()=>{
      const res = await _vehicleLogsService.GetActiveEntriesByType({dateFrom:getCurrentDateYMD()});
      return res?.map(c=>({type:c.vehicleType,value:c.total}))
    },
    initialData:[],
    refetchInterval:REFETCH_INTERVAL
  })
    const config = {
      data: typeCount,
      height: 400,
      xField: 'type',
      yField: 'value',
      colorField: 'type',
      state: {
        unselected: { opacity: 0.5 },
        selected: { lineWidth: 3, stroke: 'red' },
      },
      interaction: {
        elementSelect: true,
      },
      onReady: ({ chart, ...rest }:any) => {
        chart.on(
          'afterrender',
          () => {
            const { document } = chart.getContext().canvas;
            const elements = document.getElementsByClassName('element');
            elements[0]?.emit('click');
          },
          true,
        );
      },
    };
    const total =typeCount.reduce((curr,val)=>curr +=val.value ,0)
     return (
      <Card title={`Active Entries Today (${total})`}>
        <Bar {...config} />
      </Card>
     )
    
}