// LITERALS

export type region = 'almaty' | 'astana'

export type checkDataArr = [any, 'string' | 'object' | 'number' | 'boolean' | 'function' | 'undefined']






// DATABASE MODELS

export interface Account {
    id?: number,
    name: string,
    birthday: string,
    iin: string,
    region: region,
    email: string,
    password: string,
    contactKaspi: string | null,
    contactWhatspapp: string | null,
    idCardId: string | null,
    personalQrId: string,
    registerAt: Date,
    idCardConfirm: 'CONFIRM' | 'AWAITING' | 'UNCERTAIN',
    supervisorId: number | null
}

export interface Perms {
    id?: number,
    userId: number,
    permission: 'COORDINATOR' | 'ADMIN',
    preceptorId: number | 'MASTERKEY'
}

export interface Session {
    id?: number,
    key: string,
    userId: number
}

export interface MasterKey {
    id?: number,
    key: string,
    expiresAt: Date
}




// LOAD DATA TYPES

export interface emailConfirms {
    id: number,
    token: string,
    code: string,
    expiresAt: Date,
    isRegister: boolean,
    enteredData: JSON
}

export interface publicAccount {
    id?: number,
    name: string,
    birthday: string,
    iin: string,
    region: region,
    email: string,
    contactKaspi: string | null,
    contactWhatspapp: string | null,
    idCardId: string | null,
    personalQrId: string,
    registerAt: Date,
    idCardConfirm: 'CONFIRM' | 'AWAITING' | 'UNCERTAIN',
    supervisorId: number | null
}






// MODULE RETURN DATA

export type moduleReturn = {
    status: boolean,
    code: 200 | 400 | 500,
    message?: string
} 




// MIDDLEWARES

export interface SessionData {
    sessionId: number,
    sessionKey: string
}

export interface MasterKeyData {
    masterKey: string
}

export interface localSessionCheck {
    account: Account
}

export interface localPermsCheck {
    perms: 'COORDINATOR' | 'ADMIN' | 'USER'
}