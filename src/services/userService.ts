import { UsersDTO, UsersTbl } from "../types/UsersTbl";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class UserService extends GenericService<UsersTbl> {
  constructor() {
    super("user");
  }
  public async Count() {
    const { data: response } = await _fetch.get<number>(
      `${this.subdirectory}/count`
    );
    return response;
  }
  public async getAllAsync() {
    const { data: response } = await _fetch.get<UsersDTO[]>(
      `${this.subdirectory}/list`
    );
    return response;
  }
}
const _userService = new UserService();
export default _userService;
