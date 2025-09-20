// LITERALS

export type region = 'almaty' | 'astana'

export type checkDataArr = [any, 'string' | 'object' | 'number' | 'boolean' | 'function' | 'undefined']

export type requestStatus = 'AWAITING' | 'ACCEPT' | 'DENIED'

export type idCardConfirm = 'CONFIRM' | 'AWAITING' | 'UNCERTAIN'

export type permission = 'COORDINATOR' | 'ADMIN'

export type equipmentStatus = 'GET' | 'RETURN' | 'REQUEST'

export type eventPermission = 'CRD' | 'HCRD' 

export type mapMarker = sector | sectorEnter | 'VIP_Enter' | 'VVIP_Enter' | 'Hospital' | 'Main_Enter' | 'Wardrobe_1' | 'Wardrobe_2' | 'Wardrobe_3' | 'Wardrobe_4' | 'Stairs_12_Left' | 'Stairs_12_Right' | 'Restroom_Left' | 'Restroom_Right' | 'Food_Left' | 'Food_Right' | 'Stall' | 'Press_Center' | 'Stairs_21_Left' | 'Stairs_21_Right' | 'Skybox_1' | 'Skybox_2' | 'Skybox_3' | 'Skybox_4' | 'Skybox_5' | 'Skybox_6' | 'Skybox_7' | 'Skybox_8' | 'Skybox_9' | 'Skybox_10' | 'Skybox_11' | 'Skybox_12' | 'Stairs_23_Left' | 'Stairs_23_Right' | 'VVIP_Sector' | 'Stairs_32_Left' | 'Stairs_32_Right'

export type sector = 'B10' | 'B9' | 'B8' | 'B7' | 'B6' | 'B5' | 'B4' | 'B3' | 'B2' | 'B1' | 'A4' | 'A3' | 'A2' | 'A1' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11' | 'C12' | 'C13'

export type sectorEnter = `${sector}_Enter`

export type statusCode = 200 | 400 | 401 | 403 | 404 | 409 | 410 | 422 | 498 | 500

export type requestMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD' 







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
    idCardConfirm: idCardConfirm,
    supervisorId: number | null
}

export interface Perms {
    id?: number,
    userId: number,
    permission: permission,
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
    status: equipmentStatus,
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
    permission: eventPermission
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
        region: region,
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

export interface RequestBlacklist {
    id?: number,
    userId: number,
    executerId: number,
    eventId: number
}

export interface Request {
    id?: number,
    userId: number,
    guild: string,
    eventId: number,
    days: string[],
    status: requestStatus
}

export interface RequestData {
    id?: number,
    userId: number,
    guild: string,
    eventId: number,
    days: string[],
    status: requestStatus,
    account: {
        id: number,
        name: string,
        contactWhatsapp: string
    }
}

export interface Position {
    id?: number,
    publicId: string,
    name: string,
    NameNumber: number,
    location: string | null,
    volunteerId: number | null,
    eventId: number,
    day: string,
    mapLocId: string | null,
}

export interface PositionData {
    id?: number,
    publicId: string,
    name: string,
    NameNumber: number,
    location: string | null,
    volunteerId: number | null,
    eventId: number,
    day: string,
    mapLocId: string | null,
    volunteer: VolunteerData & { ccount: { 
        id: number,
        name: string
    }}
}

export interface EquipmentData {
    id?: number, 
    token: string,
    userId: number,
    providerId: number | null,
    eventId: number | null,
    day: string | null,
    expiresAt: Date,
    status: equipmentStatus,
    qrId: string,
    provider: {
        id: number,
        name: string
    },
    user: {
        id: number,
        name: string
    }
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
    idCardConfirm: idCardConfirm,
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

export interface serverRequest {
    route: string,
    loadData?: object, 
    loadQuery?: {
        [key: string]: string | number | null | undefined
    } | undefined,
    method: requestMethod
}











// MODULE RETURN DATA

export type moduleReturn = {
    status: boolean,
    code: 200 | 400 | 500,
    message?: string
} 

export type Response = {
    status: statusCode,
    message?: string,
    container?: object
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
    perms: permission | 'USER'
}

export interface localEventPermsCheck {
    perms: eventPermission | 'VOL' | 'Unexpected'
}