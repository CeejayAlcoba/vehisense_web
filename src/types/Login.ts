import { UsersTbl } from "./UsersTbl"

export type LoginPayload={
    username:string
    password:string
}

export type LoginReponse={
    token:string
    user:UsersTbl
}