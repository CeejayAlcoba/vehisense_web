import HomeCard from "./HomeCard";
import _vehicleLogsService from "../../../services/vehicleLogsService";
import TodayTotalLogsGraph from "./graphs/TodayTotalLogsGraph";
import TodayActiveEntriesGraph from "./graphs/TodayActiveEntriesGraph";
import { DatePicker, Space } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

export default function HomePage() {
  const [reportDateFrom, setReportDateFrom] = useState<string | null>(
    dayjs().format("YYYY-MM-DD")
  );
  const [reportDateTo, setReportDateTo] = useState<string | null>(
    dayjs().format("YYYY-MM-DD")
  );
  return (
    <>
      <Space direction="vertical" className="w-100 mb-2">
        <div className="row row-cols-lg-2 g-3">
          <div className="col">
            <label>Date From</label>
            <DatePicker
              className="w-100"
              placeholder="Report Date From"
              value={dayjs(reportDateFrom)}
              onChange={(date) =>
                date
                  ? setReportDateFrom(dayjs(date).format("YYYY-MM-DD"))
                  : setReportDateFrom(null)
              }
            />
          </div>

          <div className="col">
            <label>Date To</label>
            <DatePicker
              className="w-100"
              placeholder="Report Date To"
              value={dayjs(reportDateTo)}
              onChange={(date) =>
                date
                  ? setReportDateTo(dayjs(date).format("YYYY-MM-DD"))
                  : setReportDateTo(null)
              }
            />
          </div>
        </div>
      </Space>
      <HomeCard />
      <div className="row mt-3">
        <div className="col-xl-6">
          <TodayTotalLogsGraph
            dateFrom={reportDateFrom}
            dateTo={reportDateTo}
          />
        </div>
        <div className="col-xl-6">
          <TodayActiveEntriesGraph
            dateFrom={reportDateFrom}
            dateTo={reportDateTo}
          />
        </div>
      </div>
    </>
  );
}
