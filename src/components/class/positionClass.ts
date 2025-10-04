import Cookies from 'js-cookie'

import * as Types from '../../../module/types/types.ts'
import { request } from '../../module/serverRequest.ts'
import { errorLogger } from '../../module/errorLogger.ts'

import { Volunteer } from './volunteerClass.ts'

export class Position {
    data: Types.PositionData;
    setErrorMessage: (msg: string | null) => void
    
    _destroyed: boolean = false

    private constructor(volunteer: Types.PositionData, setErrorMessage: (msg: string | null) => void) {
        this.data = volunteer;
        this.setErrorMessage = setErrorMessage
    }

    static async create(setErrorMessage: (message: string | null) => void, eventId: number, day: string): Promise<Position[] | ReturnType<typeof errorLogger>> {
            
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) return errorLogger(setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'POST', route: 'event/position/data/all', loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId,
                    day
                }
            }})
        
            if(res.status === 200) {
                const container = res.container as Types.PositionData[]
            
                const positions = container.map(item => new Position(item, setErrorMessage))
                return positions
            }
        }catch (err: any) {
            const res = err.response.data as Types.Response
            return errorLogger(setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }

    }

    async setVolunteer(volunteerClass: Volunteer, setPositionsData: React.Dispatch<React.SetStateAction<Types.PositionData[]>>) {
        try {
            if(this._destroyed) return errorLogger(this.setErrorMessage, { status: 410, message: 'Позиция удалена' })

            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/position/volunteer/set`, loadQuery: {positionId: this.data.id, volunteerId: volunteerClass.data.id }, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) {
                setPositionsData(prev => prev.map(pos => pos.volunteerId === volunteerClass.data.id ? { ...pos, volunteer: null, volunteerId: null } : pos))

                this.data.volunteerId = volunteerClass.data.id as number
                this.data.volunteer = { ...volunteerClass.data, account: { id: volunteerClass.data.account.id, name: volunteerClass.data.account.name } }
            }
        
            return res as Types.Response
        }catch (err: any) {
            const res = err?.response?.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async changeLocation(newLoc: string) {
        try {
            if(this._destroyed) return errorLogger(this.setErrorMessage, { status: 410, message: 'Позиция удалена' })

            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/position/location/update`, loadQuery: { positionId: this.data.id }, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                },
                location: newLoc
            }})

            if(res.status === 200) {
                this.data.location = newLoc
            }
        
            return res as Types.Response
        }catch (err: any) {
            const res = err?.response?.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async clearVolunteer() {
        try {
            if(this._destroyed) return errorLogger(this.setErrorMessage, { status: 410, message: 'Позиция удалена' })

            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'PATCH', route: `/event/position/clear/${this.data.id}`, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) {
                this.data.volunteer = null
                this.data.volunteerId = null
            }
        
            return res as Types.Response
        }catch (err: any) {
            const res = err?.response?.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    async delete() {
        try {
            if(this._destroyed) return errorLogger(this.setErrorMessage, { status: 410, message: 'Позиция удалена' })

            const session: string | undefined = Cookies.get("session")

            if(!session) throw errorLogger(this.setErrorMessage, { status: 400, message: 'Сессия отсутствует' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({method: 'DELETE', route: `/event/position/destroy`, loadQuery: { positionId: this.data.id }, loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId: this.data.eventId,
                    day: this.data.day
                }
            }})

            if(res.status === 200) {
                this._destroyed = true
            }
        
            return res as Types.Response
        }catch (err: any) {
            const res = err?.response?.data as Types.Response
            return errorLogger(this.setErrorMessage, { status: res?.status ?? 500, message: res?.message ?? 'Unexpected error' })
        }
    }

    get actualData() { return this.data } 

    set update(update: Types.PositionData) { this.data = update }
}