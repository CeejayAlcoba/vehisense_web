



import { RolesTbl } from "../types/RolesTbl";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class RoleService extends GenericService<RolesTbl> {
    constructor() {
        super("roles");
    }

}
const _roleService = new RoleService();
export default  _roleService
