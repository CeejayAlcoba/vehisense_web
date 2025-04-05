import { UsersTbl } from "../types/UsersTbl";
import GenericService from "./genericService";

class UserService extends GenericService<UsersTbl> {
    constructor() {
        super("user");
    }
}
const _userService = new UserService();
export default  _userService
