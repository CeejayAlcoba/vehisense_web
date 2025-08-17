
import { AuditLogs, AuditLogsDateRange } from "../types/AuditLogs";
import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";
import GenericService from "./genericService";

class AuditLogsService extends GenericService<AuditLogs> {
    constructor() {
        super("audit-logs");
    }
    
  public async getAllAsync(data?: AuditLogsDateRange){
        const params = objectToUrlParams(data);
        const { data: response } = await _fetch.get<AuditLogs[]>(`${this.subdirectory}/list?${params}`);
        return response;
    }
}
const _auditLogsService = new AuditLogsService();
export default  _auditLogsService
