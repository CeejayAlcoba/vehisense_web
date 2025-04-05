
export type VehiclesTbl = {
 	id? : number;
	plateNumber : string;
	owner : string;
	stickerNumber? : string;
	registeredAt : Date;
	vehicleType? : string;

};

export type VehicleDateRange = {
	registerFrom? : Date|null|string;
   registerTo : Date|null|string;
};