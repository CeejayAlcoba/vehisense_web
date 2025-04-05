
export type UsersTbl = {
 	id? : number;
	username : string;
	salt : string;
	passwordHash : string;
	roleId : number;
	createdAt : Date;

};