export type VehicleLogs = {
  id?: number;
  vehicleId?: number;
  plateNumber: string;
  entryTime?: Date;
  exitTime?: Date;
  isRegistered: boolean;
  vehicleType?: string;
};

export type VehicleLogsTotal = {
  total: number;
  registred: number;
  unRegistered: number;
};
export type VehicleLogsDateRange = {
  dateFrom?: Date | null |string;
  dateTo?: Date | null|string;
};
export type VehicleLogsCountType = {
  vehicleType: string;
  total: number;
};
