

import { VehicleDateRange, VehiclesTbl } from "../types/VehiclesTbl";
import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class VehicleService extends GenericService<VehiclesTbl> {
    constructor() {
        super("vehicles");
    }
    public async Count(data?:VehicleDateRange){
        const params = objectToUrlParams(data)
        const {data:response} = await _fetch.get<number>(`${this.subdirectory}/count?${params}`);
        return response;
    }
     public async getById(id: number) {
    if (!id) throw new Error("Vehicle ID is required");
    const { data } = await _fetch.get<VehiclesTbl>(`${this.subdirectory}/${id}`);
    return data;
  }

  public async deleteByIdAsync(id: number) {
    const { data } = await _fetch.delete(`${this.subdirectory}/${id}`);
    return data;
  }

}
const _vehicleService = new VehicleService();
export default  _vehicleService
