
import { VehicleLogs, VehicleLogsCountType, VehicleLogsDateRange, VehicleLogsWithHourSpent } from "../types/VehicleLogs";
import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class VehicleLogsService extends GenericService<VehicleLogs> {
    constructor() {
        super("vehicle-logs");
    }
    public async getAllAsync(data?: VehicleLogsDateRange){
        const params = objectToUrlParams(data);
        const { data: response } = await _fetch.get<VehicleLogsWithHourSpent[]>(`${this.subdirectory}/list?${params}`);
        return response;
    }
    public async CountByType(data?:VehicleLogsDateRange){
        const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<VehicleLogsCountType[]>(`${this.subdirectory}/count-by-type?${params}`);
        return response;
    }
    public async GetActiveEntriesByType(data?:VehicleLogsDateRange){
        const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<VehicleLogsCountType[]>(`${this.subdirectory}/count-active-by-type?${params}`);
        return response;
    }
    public async GetActiveEntries(data?:VehicleLogsDateRange){
        const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<VehicleLogs[]>(`${this.subdirectory}/active?${params}`);
        return response;
    }
    public async GetExit(data?:VehicleLogsDateRange){
        const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<VehicleLogs[]>(`${this.subdirectory}/exit?${params}`);
        return response;
    }
    public async GetUnregisterOverDues(){
        const {data:response} = await _fetch.get<VehicleLogs[]>(`${this.subdirectory}/unregister/over-dues`);
        return response;
    }
    public async CountUnregisterOverDues(){
        const {data:response} = await _fetch.get<number>(`${this.subdirectory}/unregister/over-dues/count`);
        return response;
    }


}
const _vehicleLogsService = new VehicleLogsService();
export default  _vehicleLogsService
