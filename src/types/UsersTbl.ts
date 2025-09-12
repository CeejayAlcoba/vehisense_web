import { RolesTbl } from "./RolesTbl";

export type UsersTbl = {
 	id? : number;
	username : string;
	roleId : number;
	createdAt? : Date;
};

export type UsersDTO = {
	id? : number;
   username : string;
   roleId : number;
   createdAt : Date;
   role:RolesTbl
};