import { VehicleLogs } from "./VehicleLogs";

export type OverDueDTO = {
  isInWarningList? :boolean
} & VehicleLogs;
