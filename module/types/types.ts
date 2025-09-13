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

export interface PasswordRecovery {
    id?: number,
    token: string,
    userId: number,
    expiresAt: Date
}

export interface Equipment {
    id?: number, 
    token: string,
    userId: number,
    providerId: number | null,
    eventId: number | null,
    day: string | null,
    expiresAt: Date,
    status: 'REQUEST' | 'GET' | 'RETURN',
    qrId: string
}

export interface Event {
    id?: number,
    name: string,
    info: object,
    uniqueInfo: object,
    guilds: string[],
    days: string[],
    isRegisterOpen: boolean
}

export interface GroupLink {
    id?: number,
    link: string,
    eventId: number,
    day: string
}

export interface EventPerms {
    id?: number,
    userId: number,
    eventId: number,
    preceptorId: number,
    day: string,
    permission: 'CRD' | 'HCRD'
}

export interface Volunteer {
    id?: number,
    userId: number,
    guild: string,
    visit: boolean,
    late: boolean,
    eventId: number,
    day: string,
    warning: boolean,
    inStaffRoom: boolean,
}

export interface VolunteerData {
    id?: number,
    userId: number,
    guild: string,
    visit: boolean,
    late: boolean,
    eventId: number,
    day: string,
    warning: boolean,
    inStaffRoom: boolean,
    account: {
        id: number,
        name: string,
        birthday: string,
        region: 'almaty' | 'astana',
        iin: string,
        email: string,
        contactKaspi: string | null,
        contactWhatsapp: string | null
    }
}

export interface Blacklist {
    id?: number,
    userId: number,
    executerId: number
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

export interface personalData {
    name: string,
    birthday: string,
    iin: string,
    region: region
}

export interface contactData {
    contactKaspi: string | null,
    contactWhatsapp: string | null
}

export interface eventInfoObject {
    dressCode: {
        accept: string[],
        deny: string[]
    },
    behavior: (string[])[],
    rules: (string[])[]
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

export interface eventPermsData {
    day: string,
    eventId: number,
    
}

export interface localSessionCheck {
    account: Account,
    session: {
        key: string,
        id: number
    }
}

export interface localPermsCheck {
    perms: 'COORDINATOR' | 'ADMIN' | 'USER'
}

export interface localEventPermsCheck {
    perms: 'CRD' | 'HCRD' | 'VOL' | 'Unexpected'
}