
export type BlacklistedVehicles = {
 	id? : number;
	vehiclePlate : string;
	reason : string;
	blacklistedAt? : Date;
};
export type BlacklistedVehiclesDateRange = {
	blacklistedFrom? : string | Date;
	blacklistedTo : string | Date;
};