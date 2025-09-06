export type region = 'almaty' | 'astana'

export type checkDataArr = [any, 'string' | 'object' | 'number' | 'boolean' | 'function' | 'undefined']

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
export interface emailConfirms {
    id: number,
    token: string,
    code: string,
    expiresAt: Date,
    isRegister: boolean,
    enteredData: JSON
}

export type moduleReturn = {
    status: boolean,
    code: 200 | 400 | 500,
    message?: string
} 

export interface Session {
    id?: number,
    key: string,
    userId: number
}