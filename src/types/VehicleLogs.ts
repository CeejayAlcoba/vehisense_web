export type VehicleLogs = {
  id?: number;
  vehicleId?: number;
  plateNumber: string;
  entryTime?: Date;
  exitTime?: Date;
  isRegistered: boolean;
  vehicleType?: string;
  isAllowed?: boolean;
  remarks?: boolean
};

export type VehicleLogsTotal = {
  total: number;
  registred: number;
  unRegistered: number;
};
export type VehicleLogsDateRange = {
  dateFrom?: Date | null | string;
  dateTo?: Date | null | string;
  plateNumber? :string | null
};
export type VehicleLogsCountType = {
  vehicleType: string;
  total: number;
};

export type VehicleLogsWithHourSpent = {
  hoursSpent?: number;
} & VehicleLogs;