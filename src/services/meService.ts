import { ProfileEditDTO } from "../types/ProfileEditDTO";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class meService extends GenericService<ProfileEditDTO> {
  constructor() {
    super("me");
  }
  public async Update(data?: ProfileEditDTO) {
    const { data: response } = await _fetch.post(`${this.subdirectory}`, data);
    return response;
  }
}
const _meService = new meService();
export default _meService;
