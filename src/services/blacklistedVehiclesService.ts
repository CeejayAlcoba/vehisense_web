
import { BlacklistedVehicles, BlacklistedVehiclesDateRange } from "../types/BlacklistedVehicles";
import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class BlacklistedVehiclesService extends GenericService<BlacklistedVehicles> {
    constructor() {
        super("blacklisted-vehicles");
    }
    public async Count(data?:BlacklistedVehiclesDateRange){
         const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<number>(`${this.subdirectory}/count?${params}`);
        return response;
    }

}
const _blacklistedVehiclesService = new BlacklistedVehiclesService();
export default  _blacklistedVehiclesService
