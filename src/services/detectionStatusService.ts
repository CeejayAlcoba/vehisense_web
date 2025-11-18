import _fetch from "./_fetch";
import { DetectionStatus, DetectionLog, SystemRunningResponse, TodayDetectionsResponse } from "../types/DetectionStatus";

class DetectionStatusService {
  private subdirectory = "DetectionStatus";

  public async getCurrentStatus() {
    const { data } = await _fetch.get<DetectionStatus>(`${this.subdirectory}/current`);
    return data;
  }

  public async isSystemRunning() {
    const { data } = await _fetch.get<SystemRunningResponse>(`${this.subdirectory}/is-running`);
    return data;
  }

  public async getTodayDetections() {
    const { data } = await _fetch.get<TodayDetectionsResponse>(`${this.subdirectory}/today-detections`);
    return data;
  }

  public async getStatusHistory(from?: Date, to?: Date) {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());
    
    const { data } = await _fetch.get<DetectionStatus[]>(
      `${this.subdirectory}/history?${params.toString()}`
    );
    return data;
  }

  public async getRecentLogs(limit: number = 100) {
    const { data } = await _fetch.get<DetectionLog[]>(`${this.subdirectory}/logs?limit=${limit}`);
    return data;
  }

  public async getErrorLogs(from?: Date, to?: Date) {
    const params = new URLSearchParams();
    if (from) params.append("from", from.toISOString());
    if (to) params.append("to", to.toISOString());
    
    const { data } = await _fetch.get<DetectionLog[]>(
      `${this.subdirectory}/errors?${params.toString()}`
    );
    return data;
  }
  // ============================================
  // EXIT METHODS
  // ============================================

  public async getExitCurrentStatus() {
    const { data } = await _fetch.get<DetectionStatus>(`${this.subdirectory}/exit/current`);
    return data;
  }

  public async isExitSystemRunning() {
    const { data } = await _fetch.get<SystemRunningResponse>(`${this.subdirectory}/exit/is-running`);
    return data;
  }

  public async getExitTodayDetections() {
    const { data } = await _fetch.get<TodayDetectionsResponse>(`${this.subdirectory}/exit/today-detections`);
    return data;
  }

  // ============================================
  // COMBINED METHODS
  // ============================================

  public async getCombinedStatus() {
    const { data } = await _fetch.get<{
      entrance: DetectionStatus;
      exit: DetectionStatus;
      timestamp: string;
      summary: {
        entranceOnline: boolean;
        exitOnline: boolean;
        totalDetectionsToday: number;
        activeVehicles: number;
      };
    }>(`${this.subdirectory}/combined`);
    return data;
  }

  public async getSystemSummary() {
    const { data } = await _fetch.get<{
      systems: {
        entrance: { isRunning: boolean; detectionsToday: number };
        exit: { isRunning: boolean; detectionsToday: number };
      };
      totals: {
        entrances: number;
        exits: number;
        discrepancy: number;
      };
      systemHealth: {
        allOnline: boolean;
        partialOnline: boolean;
        allOffline: boolean;
      };
      timestamp: string;
    }>(`${this.subdirectory}/summary`);
    return data;
  }
}

const _detectionStatusService = new DetectionStatusService();
export default _detectionStatusService;