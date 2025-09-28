import Cookies from 'js-cookie'

import * as Types from '../../../module/types/types.ts'
import { request } from '../../module/serverRequest.ts'
import { errorLogger } from '../../module/errorLogger.ts'

export class Event {
    data: Types.Event;
    setErrorMessage: (msg: string | null) => void

    private constructor(data: Types.Event, setErrorMessage: (msg: string | null) => void) {
        this.data = data;
        this.setErrorMessage = setErrorMessage
    }

    static async create(setErrorMessage: (message: string | null) => void, name: string): Promise<Event | ReturnType<typeof errorLogger>> {
        
        try {
            const res = await request({method: 'GET', route: 'event/data/byName', loadQuery: { name }})
        
            if(res.status === 200) {
                const container = res.container as { event: Types.preParsedEvent }

                const parsedEvent: Types.Event = {
                    ...container.event,
                    days: JSON.parse(container.event.days),
                    guilds: JSON.parse(container.event.guilds),
                    info: JSON.parse(container.event.info),
                    uniqueInfo: JSON.parse(container.event.uniqueInfo)
                }
            
                return new Event(parsedEvent, setErrorMessage)

            } else throw errorLogger(setErrorMessage, { status: 500, message: 'Event undefined' })
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }

    }

    async updateInfo(setErrorMessage: (message: string | null) => void, newInfo: Types.eventInfoObject) {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PUT', route: 'event/info/update', loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.id,
                    day: this.data.days[0]
                },
                info: newInfo
            }})
        
            return res as Types.Response
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async setLink(setErrorMessage: (message: string | null) => void, day: string, newLink: Types.eventInfoObject) {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'POST', route: 'event/linkadd', loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.id,
                    day: day
                },
                link: newLink
            }})
        
            return res as Types.Response
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async getVolunteers(setErrorMessage: (message: string | null) => void, day: string) {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'POST', route: `event/volunteer/data/all/${this.data.id}`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.id,
                    day: day
                }
            }})
        
            if(res.status === 200) {
                return res as { status: Types.statusCode, container: (Types.VolunteerData & Types.moreVolsData)[] }
            }
            else return res as Types.Response
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }
}