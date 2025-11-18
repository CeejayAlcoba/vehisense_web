import { VehicleRegistration } from "../types/VehicleRegistration";
import _fetch from "./_fetch";

class VehicleRegistrationService {
  private subdirectory = "vehicle-registration";

  public async getAllAsync() {
    const { data } = await _fetch.get<VehicleRegistration[]>(
      `${this.subdirectory}/list`
    );
    return data;
  }

  public async insertAsync(data: FormData) {
    const { data: response } = await _fetch.post<VehicleRegistration>(
      this.subdirectory,
      data
    );
    return response;
  }

  public async GetById(id: number) {
    const { data } = await _fetch.get<VehicleRegistration>(
      `${this.subdirectory}/${id}`
    );
    return data;
  }

  public async GetOrCr(id: number) {
    const response = await _fetch.get<Blob>(
      `${this.subdirectory}/${id}/orcr`,
      { responseType: "blob" } 
    );
    return response.data;
  }
public async UpdatePatch(id: number, data: VehicleRegistration) {
    const { data: response } = await _fetch.patch<VehicleRegistration>(
      `${this.subdirectory}/${id}`, 
      data
    );
    return response;
  }
 public async getNextStickerNumber(): Promise<string> {
  const { data } = await _fetch.get<string>(`${this.subdirectory}/next-sticker-number`);
  return data;
}
  public async updateAsync(id: number, data: FormData) {
    const { data: response } = await _fetch.put<VehicleRegistration>(
      `${this.subdirectory}/${id}`, 
      data
    );
    return response;
  }
}

const _vehicleRegistrationService = new VehicleRegistrationService();
export default _vehicleRegistrationService;