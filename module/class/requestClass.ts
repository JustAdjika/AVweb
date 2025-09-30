// DEPENDENCIES

// MODULES
import * as Types from '../types/types.ts'
import { Volunteer } from './volunteerClass.ts'
import { sendMail } from '../emailSend.ts'

// DATABASE
import REQUESTS_TAB from '../../database/requests.js'
import REQUESTBLACKLISTS_TAB from '../../database/requestBlacklists.js'
import ACCOUNTS_TAB from '../../database/accounts.js'
import AVSTAFFS_TAB from '../../database/avstaffs.js'
import GROUPLINKS_TAB from '../../database/groupLinks.js'

// MIDDLEWARES


export class Request {
    // Data
    private id: number | null = null
    private userId: number | null = null
    private guild: string | null = null
    private eventId: number | null = null
    private days: string[] = []
    private status: Types.requestStatus | null = null
    private shift: Types.shift = '1st'







    // Constructor
    private constructor(
        id: number | null = null,
        userId: number | null,
        guild: string | null,
        eventId: number | null,
        days: string[],
        status: Types.requestStatus | null,
        shift: Types.shift
    ) {
        this.id = id
        this.userId = userId
        this.guild = guild
        this.days = days
        this.eventId = eventId,
        this.status = status
        this.shift = shift
    }

    static async define() {
        return new Request(
            null,
            null,
            null,
            null,
            [],
            null,
            '1st'
        )
    }

    static async create(userId: number, guild: string, eventId: number, days: string[], shift: Types.shift) {
        const foundBlacklist = await REQUESTBLACKLISTS_TAB.findOne({ where: { userId } })
        if(foundBlacklist) throw new Error('Module requestClass.ts error: The user was added to the request blacklist at this event')

        const foundConflict = await REQUESTS_TAB.findOne({ where: { userId, eventId } })

        if(foundConflict) {
            const foundConflictModel: Types.Request = await foundConflict.get({ plain: true })

            if(foundConflictModel.status === 'ACCEPT') throw new Error('Module requestClass.ts error: Found accepted conflict, impossible to create new event request')

            await foundConflict.destroy()
        }

        if(guild === 'AV') {
            const foundAvStaff = await AVSTAFFS_TAB.findOne({ where: { userId } })

            if(!foundAvStaff) throw new Error('Module requestClass.ts error: User is not AV_VOLUNTEER')
        }

        const newRequest = await REQUESTS_TAB.create({
            userId,
            guild,
            eventId,
            days,
            status: 'AWAITING',
            shift
        })

        const newRequestModel: Types.Request = await newRequest.get({ plain: true })

        return new Request(
            newRequestModel.id as number,
            newRequestModel.userId,
            newRequestModel.guild,
            newRequestModel.eventId,
            newRequestModel.days,
            newRequestModel.status,
            newRequestModel.shift
        )
    }






    // Set data

    async update(id: number | undefined) {

        if(!this.id && !id) throw new Error('Module requestClass.ts error: Impossible to use accept() before define it or select id')

        const currentRequest = await REQUESTS_TAB.findOne({ where: id ? { id } : { id: this.id } })
        if(!currentRequest) throw new Error('Module requestClass.ts error: update() undefined currentRequest by id')
        const currentRequestModel: Types.Request = await currentRequest.get({ plain: true })
        
        this.id = currentRequestModel.id as number
        this.userId = currentRequestModel.userId
        this.guild = currentRequestModel.guild
        this.days = currentRequestModel.days
        this.eventId = currentRequestModel.eventId,
        this.status = currentRequestModel.status
        this.shift = currentRequestModel.shift
    }

    async accept(days: string[], shift: Types.shift) {

        if(!this.id) throw new Error('Module requestClass.ts error: Impossible to use accept() before define it')

        if(days.length === 0) throw new Error('Module requestClass.ts error: Impossible to accept the request without days')

        const currentRequest = await REQUESTS_TAB.findOne({ where: { id: this.id } })
        if(!currentRequest) throw new Error('Module requestClass.ts error: accept() undefined currentRequest by id')

        const currentRequestModel: Types.Request = await currentRequest.get({ plain: true })

        const foundUser = await ACCOUNTS_TAB.findOne({ where: { id: currentRequestModel.userId } })
        if(!foundUser) throw new Error('Module requestClass.ts error: accept() User undefined')

        const foundUserModel: Types.Account = await foundUser.get({ plain: true })

        const foundLinks = await GROUPLINKS_TAB.findAll({ where: { eventId: this.eventId } })
        if(!foundLinks) throw new Error('Module requestClass.ts error: accept() Links undefined')

        const foundLinksModel: Types.GroupLink[] = foundLinks.map( item => item.get({ plain: true }) ) 

        const acceptedDays = foundLinksModel.filter(link => days.some(day => day === link.day))

        // Процесс внесения в волонтеры

        for(const item of days) {
            if(!JSON.parse(this.days as unknown as string).includes(item)) throw new Error('Module requestClass.ts error: Impossible to accept the days, that the user has not selected')
        } 

        if(this.shift === '1st' || this.shift === '2nd') {
            if(shift === 'both' || shift !== this.shift) throw new Error('Module requestClass.ts error: Impossible to accept the shift, that the user has not selected')
        }

        this.status = 'ACCEPT'

        await currentRequest.update({ status: 'ACCEPT' })

        const parsedDays = JSON.parse(this.days as unknown as string) as string[]

        parsedDays.map(day => Volunteer.create(this.userId as number, this.guild as string, this.eventId as number, day, shift))
        
        const result = await sendMail(foundUserModel.email, `Вердикт к вашей заявки на событие`, `Ваша заявка была одобрена составом координаторов, вы допущены к событию, всю подробную информацию о событии узнайте на сайте. Ссылка на группы: ${acceptedDays.map(day => (`день ${day.day} - ${day.link}, `))}`)
    
        if(!result.status) throw new Error(`Module requestClass.ts error: accept() ${result.message}`)

    }

    async denied(why: string) {

        if(!this.id) throw new Error('Module requestClass.ts error: Impossible to use deny() before define it')

        const currentRequest = await REQUESTS_TAB.findOne({ where: { id: this.id } })
        if(!currentRequest) throw new Error('Module requestClass.ts error: denied() undefined currentRequest by id')
        
        const currentRequestModel: Types.Request = await currentRequest.get({ plain: true })

        const foundUser = await ACCOUNTS_TAB.findOne({ where: { id: currentRequestModel.userId } })
        if(!foundUser) throw new Error('Module requestClass.ts error: denied() User undefined')

        const foundUserModel: Types.Account = await foundUser.get({ plain: true })

        this.status = 'DENIED'

        await currentRequest.update({ status: 'DENIED' })

        const result = await sendMail(foundUserModel.email, `Вердикт к вашей заявки на событие`, `Ваша заявка была отклонена составом координаторов, по причине: ${why}`)

        if(!result.status) throw new Error(`Module requestClass.ts error: denied() ${result.message}`)

    }





    // Get data
     
    get getModel() {
        return {
            id: this.id,
            userId: this.userId,
            guild: this.guild,
            days: this.days,
            eventId: this.eventId,
            status: this.status,
            shift: this.shift
        }
    }

    async getInstance() {
        if(!this.id) throw new Error('Module requestClass.ts error: Impossible to use getInstance() before define it')

        const currentRequest = await REQUESTS_TAB.findOne({ where: { id: this.id } })
        if(!currentRequest) throw new Error('Module requestClass.ts error: getInstance() undefined instance of object by id')
        return currentRequest
    }

    async getActual() {
        if(!this.id) throw new Error('Module requestClass.ts error: Impossible to use getActual() before define it')

        const foundRequests = await REQUESTS_TAB.findAll({ where: { eventId: this.eventId, status: 'AWAITING' } })
        const foundRequestsModel: (Types.Request)[] = foundRequests.map(request => request.get({ plain: true }))

        return foundRequestsModel
    }
}