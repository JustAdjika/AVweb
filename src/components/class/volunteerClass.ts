import Cookies from 'js-cookie'

import * as Types from '../../../module/types/types.ts'
import { request } from '../../module/serverRequest.ts'
import { errorLogger } from '../../module/errorLogger.ts'

export class Volunteer {
    data: Types.VolunteerData & Types.moreVolsData;
    setErrorMessage: (msg: string | null) => void

    private constructor(volunteer: Types.VolunteerData & Types.moreVolsData, setErrorMessage: (msg: string | null) => void) {
        this.data = volunteer;
        this.setErrorMessage = setErrorMessage
    }

    static async create(setErrorMessage: (message: string | null) => void, volunteer: Types.VolunteerData & Types.moreVolsData): Promise<Volunteer | ReturnType<typeof errorLogger>> {
        try {
            return new Volunteer(volunteer, setErrorMessage)
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }

    }

    async visitChange() {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/volunteer/visit/change/${this.data.id}`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) this.data.visit = !this.data.visit
        
            return res as Types.Response
        }catch (err: any) {
            const res = err?.response?.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async lateChange() {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/volunteer/late/change/${this.data.id}`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) this.data.late = !this.data.late
        
            return res as Types.Response
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async staffRoomChange() {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/volunteer/staffRoom/change/${this.data.id}`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) this.data.inStaffRoom = !this.data.inStaffRoom
        
            return res as Types.Response
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async warnChange() {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            if(this.data.blacklist) {
                const res = await request({method: 'DELETE', route: `/measure/blacklist/remove/userId`, loadQuery: { userId: this.data.userId }, loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                }})

                if(res.status === 200) this.data.blacklist = false
            
                return res as Types.Response
            }

            if(this.data.warning) {
                const res = await request({method: 'POST', route: `/measure/blacklist/add/${this.data.userId}`, loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                }})

                if(res.status === 200) this.data.blacklist = true
            
                return res as Types.Response
            } else {
                const res = await request({method: 'PATCH', route: `/event/volunteer/warn`, loadQuery: { volunteerId: this.data.id }, loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                    eventPerms: {
                        eventId: this.data.eventId,
                        day: this.data.day
                    }
                }})

                if(res.status === 200) this.data.warning = !this.data.warning
        
                return res as Types.Response
            }
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async changeCRD() {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            if(this.data.role === 'HCRD') return

            if(this.data.role === 'CRD') {
                const res = await request({method: 'PATCH', route: `/event/volunteer/reduce/${this.data.id}`, loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                    eventPerms: {
                        eventId: this.data.eventId,
                        day: this.data.day
                    }
                }})

                if(res.status === 200) this.data.role = 'VOL'
        
                return res as Types.Response
            } else {
                const res = await request({method: 'PATCH', route: `/event/volunteer/promote/CRD/${this.data.id}`, loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                    eventPerms: {
                        eventId: this.data.eventId,
                        day: this.data.day
                    }
                }})

                if(res.status === 200) this.data.role = 'CRD'
        
                return res as Types.Response
            }
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }
}