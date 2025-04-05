import { toast, ToastOptions } from "react-toastify";

export default function Toast(constent:string, options?:ToastOptions){
    return toast(constent,{
        type:"success",
        ...options
    })
}