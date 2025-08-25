import { VehicleRegistration } from "../types/VehicleRegistration";
import _fetch from "./_fetch";

let subdirectory = "vehicle-registration";
class VehicleRegistrationService {
  public async insertAsync(data: FormData) {
    const { data: response } = await _fetch.post<VehicleRegistration>(
      subdirectory,
      data
    );
    return response;
  }
  public async GetById(id: number) {
    const { data } = await _fetch.get<VehicleRegistration>(
      `${subdirectory}/${id}`
    );
    return data;
  }

  public async GetOrCr(id: number) {
    const response = await _fetch.get<Blob>(
      `${subdirectory}/${id}/orcr`,
      { responseType: "blob" } 
    );
    return response.data;
  }
}
const _vehicleRegistrationService = new VehicleRegistrationService();
export default _vehicleRegistrationService;
