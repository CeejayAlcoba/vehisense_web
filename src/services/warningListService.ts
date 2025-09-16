


import { WarningList } from "../types/WarningList";
import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class WarningListService extends GenericService<WarningList> {
    constructor() {
        super("warning-list");
    }
    public async GetAll({plateNumber,vehicleType}:any){
        const params = objectToUrlParams({plateNumber,vehicleType})
        const {data:response} = await _fetch.get<number>(`${this.subdirectory}/list?${params}`);
        return response;
    }
    public async deleteByPlateNumber(plateNumber:string) {
        const {data:response}= await _fetch.delete<WarningList>(`${this.subdirectory}/plate-number/${plateNumber}`);
        return response;
    }
}
const _warningListService = new WarningListService();
export default  _warningListService
