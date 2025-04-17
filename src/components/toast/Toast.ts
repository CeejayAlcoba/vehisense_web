import { toast, ToastContent, ToastOptions } from "react-toastify";

export default function Toast(content:ToastContent<unknown>, options?:ToastOptions){
    return toast(content,{
        type:"success",
        ...options
    })
}