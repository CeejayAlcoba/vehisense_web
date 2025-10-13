
import { OverDueMinutes } from "../types/OverDueMinutes";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class OverDueMinutesService extends GenericService<OverDueMinutes> {
    constructor() {
        super("over-due-minutes");
    }
    public async get(){
        const {data:response}= await _fetch.get<OverDueMinutes>(`${this.subdirectory}`);
        return response;
    }


}
const _overDueMinutesService = new OverDueMinutesService();
export default  _overDueMinutesService
