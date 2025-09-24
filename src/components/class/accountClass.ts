import Cookies from 'js-cookie'

import * as Types from '../../../module/types/types.ts'
import { request } from '../../module/serverRequest.ts'
import { getUser } from '../../module/getUser.ts'
import api from '../../module/axiosConfig.ts'

type extendedAccount = Types.Account & { role: Types.permission | 'USER' | 'VOLUNTEER' } 

export class Account {
    data: extendedAccount;

    private constructor(data: extendedAccount) {
        this.data = data;
    }

    static async create(setErrorMessage: (message: string | null) => void): Promise<Account> {
        const user = await getUser({ setErrorMessage }) as Types.Account

        interface correctReturnData {
            status: Types.statusCode,
            container: {
                result: boolean
            }
        }
        
        const isVolunteer = await request({ method: 'GET', route: '/perms/is/AV_VOLUNTEER', loadQuery: { userId: user.id } }) as correctReturnData
        const isCoordinator = await request({ method: 'GET', route: '/perms/is/COORDINATOR', loadQuery: { userId: user.id } }) as correctReturnData
        const isAdmin = await request({ method: 'GET', route: '/perms/is/ADMIN', loadQuery: { userId: user.id } }) as correctReturnData

        if(!isAdmin?.container || !isCoordinator.container || !isVolunteer.container) {
            const errorAccount: extendedAccount = { ...user, role: 'USER' } 
            return new Account(errorAccount)
        }

        const extendedAccount: extendedAccount = { ...user, role: isAdmin.container.result ? 'ADMIN' : isCoordinator.container.result ? 'COORDINATOR' : isVolunteer.container.result ? 'VOLUNTEER' : 'USER' }

        return new Account(extendedAccount);
    }

    async updateContactInfo({ contactWhatsapp, contactKaspi }: { contactWhatsapp: string | null, contactKaspi: string | null }) {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'PUT', route: '/account/info/contact/edit', loadData: {
                userId: this.data.id,
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                contactInfo: {
                    contactKaspi,
                    contactWhatsapp
                }
            } })

            return res
        }
    }

    async updateEmailgetToken(email: string) {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'POST', route: '/account/emailChange', loadData: {
                userId: this.data.id,
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                newEmail: email
            } })

            if(res.status === 200) return res as { status: Types.statusCode, container: { confirmToken: string } }
            else return res
        }
    }

    async updateEmailconfirm({ code, token }: { code: string, token: string }) {
        const session = Cookies.get("session")

        console.log('sta')

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'POST', route: `/account/emailConfirm/${token}`, loadData: {
                code,
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            } })

            if(res.status === 200) return res as { status: Types.statusCode, container: { updateData: Types.Account } }
            else return res
        }
    }

    async uploadIdCard(file: File) {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const formData = new FormData()

            formData.append("idcard", file)
            formData.append("sessionId", String(parsedSession.id))
            formData.append("sessionKey", parsedSession.key)

            const res = await api.post(`/account/idCard/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } })

            return res
        }
    }

    async getEquip() {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'POST', route: `/account/equipment/qrgenerate/get`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            } })

            if(res.status === 200) return res as { status: Types.statusCode, container: { qrId: string } }
            else return res
        }
    }

    async returnEquip() {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'POST', route: `/account/equipment/qrgenerate/return`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            } })

            if(res.status === 200) return res as { status: Types.statusCode, container: { qrId: string } }
            else return res
        }
    }

    async changePassword({ oldPassword, newPassword }: { oldPassword: string, newPassword: string }) {
        const session = Cookies.get("session")

        if(session) {
            const parsedSession = JSON.parse(session) as Types.Session

            const res = await request({ method: 'PATCH', route: `/account/password/change`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                userId: parsedSession.userId,
                oldPassword,
                newPassword
            } })

            return res
        }
    }
}