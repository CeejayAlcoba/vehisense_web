import HomeCard from "./HomeCard";
import _vehicleLogsService from "../../../services/VehicleLogsService";
import TodayTotalLogsGraph from "./graphs/TodayTotalLogsGraph";
import TodayActiveEntriesGraph from "./graphs/TodayActiveEntriesGraph";

export default function HomePage() {
  return (
    <>
      <HomeCard />
      <div className="row mt-3">
        <div className="col-xl-6">
          <TodayTotalLogsGraph />
        </div>
        <div className="col-xl-6">
          <TodayActiveEntriesGraph />
        </div>
      </div>
    </>
  );
}
