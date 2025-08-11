

import { Sidebar } from "../types/Sidebar";

import _fetch from "./_fetch";
import GenericService from "./genericService";

class SidebarService extends GenericService<Sidebar> {
    constructor() {
        super("sidebar");
    }
     public async getByRoleIdAsync(){
        const {data:response} = await _fetch.get<Sidebar[]>(`${this.subdirectory}/list/auth`);
        return response;
    }
}
const _sidebarService = new SidebarService();
export default  _sidebarService
