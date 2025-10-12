
export type VehiclesTbl = {
 	id? : number;
	plateNumber : string;
	owner : string;
	ownerType?: string;
	stickerNumber : string;
	registeredAt? : Date;
	vehicleType? : string;
	vehicleModel?: string;
    vehicleColor?: string;
	registrationDate?: string; // Add this
    expirationDate?: string | null; // Add this
	students?: { studentName: string; studentNumber: string }[];
    orCrFileName?: string;
};

export type VehicleDateRange = {
	registerFrom? : Date|null|string;
   registerTo : Date|null|string;
};