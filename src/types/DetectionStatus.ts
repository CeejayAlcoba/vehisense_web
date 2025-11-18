export type DetectionStatus = {
  id?: number;
  status: "running" | "error" | "stopped" | "starting" | "unknown";
  message: string;
  timestamp: string;
  detectionsToday: number;
  uptimeSeconds: number;
  cameraConnected: boolean;
  lastPlate?: string;
  activeVehicles: number;
  createdAt?: string;
};

export type DetectionLog = {
  id?: number;
  logLevel: "INFO" | "WARNING" | "ERROR";
  message: string;
  timestamp: string;
};

export type SystemRunningResponse = {
  isRunning: boolean;
  timestamp: string;
};

export type TodayDetectionsResponse = {
  count: number;
  date: string;
};