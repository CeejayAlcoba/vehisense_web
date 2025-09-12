import objectToUrlParams from "../utils/objectToUrlParams";
import _fetch from "./_fetch";

export default class GenericService<T> {
    public subdirectory: string;

    constructor(subdirectory: string) {
        this.subdirectory = subdirectory;
    }

    public async getAllAsync(data?:Partial<T>){
         const params = objectToUrlParams(data)
        const {data:response}= await _fetch.get<T[]>(`${this.subdirectory}/list?${params}`);
        return response;
    }

    public async insertAsync(data:T) {
        const {data:response}= await _fetch.post<T>(this.subdirectory,data);
        return response;
    }
    public async updateAsync(id:number,data:T) {
        const {data:response}= await _fetch.put<T>(`${this.subdirectory}/${id}`,{...data,id});
        return response;
    }
    public async getByIdAsync(id:number) {
        const {data:response}= await _fetch.get<T>(`${this.subdirectory}/${id}`);
        return response;
    }
    public async deleteByIdAsync(id:number) {
        const {data:response}= await _fetch.delete<T>(`${this.subdirectory}/${id}`);
        return response;
    }
}
