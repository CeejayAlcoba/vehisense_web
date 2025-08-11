


import { SidebarRoleMapping } from "../types/SidebarRoleMapping";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class SidebarRoleMappingService extends GenericService<SidebarRoleMapping> {
    constructor() {
        super("sidebar-role-mapping");
    }
     public async getByRoleIdAsync(id:number){
        const {data:response} = await _fetch.get<SidebarRoleMapping[]>(`${this.subdirectory}/role/${id}`);
        return response;
    }
     public async mergeAsync(data:SidebarRoleMapping[]) {
        const {data:response}= await _fetch.post<SidebarRoleMapping[]>(`${this.subdirectory}/bulk-merge`,data);
        return response;
    }
}
const _sidebarRoleMappingService = new SidebarRoleMappingService();
export default  _sidebarRoleMappingService
