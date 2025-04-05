import { createContext, useContext } from "react";
import { UsersTbl } from "./types/UsersTbl";

type UserContextType={
 user:UsersTbl | null,
 setUser:React.Dispatch<React.SetStateAction<UsersTbl | null>>
}

export const UserContext = createContext<UserContextType|null>(null);

export default function useUserContext(){
    const context = useContext(UserContext);
    if(!context) throw new Error("user context must not null");
    return context
}