
export type AuditLogs = {
 	id? : number;
	auditBy : number;
    auditName : number;
	description : string;
	action? : string;
    auditDate? : string;
};
export type AuditLogsDateRange = {
	dateFrom? : string | Date;
	dateTo : string | Date;
};