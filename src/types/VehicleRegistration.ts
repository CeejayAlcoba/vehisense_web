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
  registrationDate?: string; // Add this
  expirationDate?: string | null;
};

export type Student = {
  id?: number;
  studentName: string;
  studentNumber: string;
};
