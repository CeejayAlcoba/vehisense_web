
import { LoginPayload, LoginReponse } from "../types/Login";
import _fetch from "./_fetch";

class AccountService  {
    private subdirectory:string="account";
    public async login(payload: LoginPayload){
        const {data:response} = await _fetch.post<LoginReponse>(`${this.subdirectory}/login`,payload);
        return response;
    }

}
const _accountService = new AccountService();
export default  _accountService
