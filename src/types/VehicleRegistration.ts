export type VehicleRegistration = {
  id?: number;
  plateNumber: string;
  ownerName: string;
  ownerType: string;
  vehicleColor: string;
  vehicleType: string;
  vehicleModel?: string;
  students: Student[];
  OrCr: File;
  orCrFileName:string
};

export type Student = {
  id?: number;
  studentName: string;
  studentNumber: string;
};
