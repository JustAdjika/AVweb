// DEPENDENCIES
import { Op } from 'sequelize'

// MODULES
import * as Types from '../types/types.ts'

// DATABASE
import EVENTS_TAB from '../../database/events.js'
import GROUPLINKS_TAB from '../../database/groupLinks.js'
import VOLUNTEERS_TAB from '../../database/volunteers.js'
import EVENTPERMS_TAB from '../../database/eventPerms.js'
import BLACKLISTS_TAB from '../../database/blacklists.js'
import EQUIPMENTS_TAB from '../../database/equipments.js'
import PERMS_TAB from '../../database/perms.js'

import * as Associations from '../../database/associations.js'

// MIDDLEWARES


export class Event {
    // Data
    private id: number | null = null
    private name: string | null = null
    private guilds: string[]
    private days: string[]
    private info: Types.eventInfoObject = {
        dressCode: {
            accept: [],
            deny: []
        },
        behavior: [],
        rules: []
    }
    private uniqueInfo = {}
    private isRegisterOpen = false






    // Constructor
    private constructor(
        id: number | null,
        name: string | null,
        guilds: string[],
        days: string[],
        info: Types.eventInfoObject,
        uniqueInfo: object,
        isRegisterOpen: boolean
    ) {
        this.id = id
        this.name = name
        this.guilds = guilds
        this.days = days
        this.info = info
        this.uniqueInfo = uniqueInfo
        this.isRegisterOpen = isRegisterOpen
    }

    static async define() {
        return new Event(
            null,
            null,
            [],
            [],
            {
                dressCode: { accept: [], deny: [] },
                behavior: [],
                rules: []
            } as Types.eventInfoObject,
            {},
            false
        )
    }

    static async create(name: string, guilds: string[], days: string[], isRegisterOpen: boolean = false) {
        const foundConflict = await EVENTS_TAB.findOne({ where: { name } })
        if(foundConflict) throw new Error('Module eventClass.ts error: cant create new event, name conflict')

        if(days.length === 0) throw new Error('Module eventClass.ts error: cant create new event, need more than 0 days')

        const newEvent = await EVENTS_TAB.create({
            name,
            guilds,
            days,
            isRegisterOpen,
            uniqueInfo: {},
            info: {
                dressCode: { accept: [], deny: [] },
                behavior: [],
                rules: []
            }
        })

        const newEventModel: Types.Event = await newEvent.get({ plain: true })

        days.map(day => {
            GROUPLINKS_TAB.create({
                day,
                link: null,
                eventId: newEventModel.id
            })
        })

        const model: Types.Event = newEvent.get({ plain: true })
        return new Event(
            model.id as number,
            model.name,
            model.guilds,
            model.days,
            model.info as Types.eventInfoObject,
            model.uniqueInfo,
            model.isRegisterOpen
        )
    }






    // Set data
    set newInfo(object: Types.eventInfoObject) {

        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use newInfo before define it')

        this.info = object

        EVENTS_TAB.findOne({ where: { id: this.id } }).then(currentEvent => {
            if(!currentEvent) throw new Error('Module eventClass.ts error: newInfo undefined currentEvent by id')
            
            currentEvent.update({ info: object })
        })
    }

    set newUniqueInfo(object: object) {

        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use newUniqueInfo before define it')

        this.uniqueInfo = object

        EVENTS_TAB.findOne({ where: { id: this.id } }).then(currentEvent => {
            if(!currentEvent) throw new Error('Module eventClass.ts error: newUniqueInfo undefined currentEvent by id')
            
            currentEvent.update({ uniqueInfo: object })
        })
    }

    async changeRegister() {

        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use changeRegister() before define it')

        this.isRegisterOpen = !this.isRegisterOpen

        const currentEvent = await EVENTS_TAB.findOne({ where: { id: this.id } })
        if(!currentEvent) throw new Error('Module eventClass.ts error: changeRegister() undefined currentEvent by id')
        await currentEvent.update({ isRegisterOpen: this.isRegisterOpen })
    }

    async update(id: number | undefined) {

        if(!this.id && !id) throw new Error('Module eventClass.ts error: Impossible to use update() before define it or select id')

        const currentEvent = await EVENTS_TAB.findOne({ where: id ? { id } : { id: this.id } })
        if(!currentEvent) throw new Error('Module eventClass.ts error: update() undefined currentEvent by id')
        const currentEventModel: Types.Event = await currentEvent.get({ plain: true })
        
        this.id = currentEventModel.id as number,
        this.name = currentEventModel.name,
        this.guilds = currentEventModel.guilds,
        this.days = currentEventModel.days
        this.isRegisterOpen = currentEventModel.isRegisterOpen
        this.info = currentEventModel.info as Types.eventInfoObject
        this.uniqueInfo = currentEventModel.uniqueInfo
    }

    setLink(day: string, link: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use setLink() before define it')

        GROUPLINKS_TAB.findOne({ where: { eventId: this.id, day } }).then(currentLink => {
            if(!currentLink) throw new Error('Module eventClass.ts error: setLink undefined link by day')
            
            currentLink.update({ link })
        })
    }

    async addHCRD(userId: number) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use addHCRD() before define it')

        const foundAccount = await Associations.ACCOUNTS_TAB.findOne({ where: { id: userId } })
        if(!foundAccount) throw new Error('Module eventClass.ts error: Impossible to use addHCRD(), account undefined')

        JSON.parse(this.days as unknown as string).map(async(day: string) => {
            await VOLUNTEERS_TAB.create({
                userId,
                guild: 'AV',
                eventId: this.id,
                day,
                visit: true,
                late: false,
                warning: false,
                inStaffRoom: true,
                shift: 'both'
            })
            await EVENTPERMS_TAB.create({
                userId,
                eventId: this.id,
                day,
                permission: 'HCRD',
                preceptorId: 'MASTERKEY'
            })
        })
    }

    async clearPosition(marker: Types.mapMarker) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use clearPosition() before define it')
        const foundPosition = await Associations.POSITIONS_TAB.findAll({ where: { mapLocId: marker, eventId: this.id } })

        foundPosition.map(async item => {
            await item.update({ volunteerId: null })
        })
    }

    async getMarkerPos(marker: Types.mapMarker, day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getMarkerPos() before define it')
        const foundPosition = await Associations.POSITIONS_TAB.findAll({ where: { mapLocId: marker, eventId: this.id, day } })

        const foundPositionsModel: (Types.Position)[] = foundPosition.map(item => item.get({ plain: true }))
        return foundPositionsModel
    }











    // Get data
    get getModel() {
        return {
            id: this.id,
            name: this.name,
            guilds: this.guilds,
            days: this.days,
            isRegisterOpen: this.isRegisterOpen,
            info: this.info,
            uniqueInfo: this.uniqueInfo 
        }
    }

    async getInstance() {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getInstance() before define it')

        const currentEvent = await EVENTS_TAB.findOne({ where: { id: this.id } })
        if(!currentEvent) throw new Error('Module eventClass.ts error: getInstance() undefined instance of object by id')
        return currentEvent
    }

    async getLink(day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getLink() before define it')

        const foundLink = await GROUPLINKS_TAB.findOne({ where: { eventId: this.id, day } })
        if(!foundLink) throw new Error('Module eventClass.ts error: getLink() undefined link by day')
        const foundLinkModel: Types.GroupLink = await foundLink.get({ plain: true })
        return foundLinkModel.link
    }

    async getVolunteers(day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getVolunteers() before define it')

        const foundVolunteers = await VOLUNTEERS_TAB.findAll({ where: { eventId: this.id, day } })
        const foundVolsModel: (Types.Volunteer)[] = foundVolunteers.map(vol => vol.get({ plain: true }))
        return foundVolsModel
    }

    async getVolunteersData(day: string) {

        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getVolunteersData() before define it')

        // Поиск данных и личной информации волонтера 
        const foundVolunteers = await Associations.VOLUNTEERS_TAB.findAll({ 
            where: { 
                eventId: this.id, 
                day 
            }, 
            include: [{ 
                model: Associations.ACCOUNTS_TAB,
                attributes: ["id", "name", "birthday", "region", "iin", "email", "contactKaspi", "contactWhatsapp"]
             }] })
        const foundVolsModel: (Types.VolunteerData)[] = foundVolunteers.map(vol => vol.get({ plain: true }))

        const ids = foundVolsModel.map(vol => vol.account.id)


        // Поиск прав волонтера
        const foundEventPerms = await EVENTPERMS_TAB.findAll({
            where: {
                userId: {
                    [Op.in]: ids
                },
                eventId: this.id,
                day
            }
        })

        const foundEventPermsModel: (Types.EventPerms)[] = foundEventPerms.map(perms => perms.get({ plain: true }))
        

        // Поиск информации об экипировке волонтера
        const foundEquipments = await EQUIPMENTS_TAB.findAll({
            where: {
                userId: {
                    [Op.in]: ids
                },
                eventId: this.id,
                day,
                [Op.or]: [
                    { status: 'GET' },
                    { status: 'RETURN' }
                ]
            }
        })

        const foundEquipmentsModel: (Types.Equipment)[] = foundEquipments.map(equip => equip.get({ plain: true }))


        // Поиск информации о занесении в ЧС
        const foundBlacklists = await BLACKLISTS_TAB.findAll({
            where: {
                userId: {
                    [Op.in]: ids
                }
            }
        })

        const foundBlacklistsModel: (Types.Blacklist)[] = foundBlacklists.map(item => item.get({ plain: true }))

        const formattedData = foundVolsModel.map(vol => {
            if(foundEventPermsModel.some(perms => perms.userId === vol.account.id && perms.permission === 'CRD')) {
                let equip: 'GET' | 'RETURN' | null = null
                
                if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'GET')) equip = 'GET'
                else if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'RETURN')) equip = 'RETURN'                
                
                return {
                    ...vol,
                    role: 'CRD',
                    equip,
                    blacklist: foundBlacklistsModel.some(item => item.userId === vol.account.id)
                }
            } else if(foundEventPermsModel.some(perms => perms.userId === vol.account.id && perms.permission === 'HCRD')) {
                let equip: 'GET' | 'RETURN' | null = null
                
                if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'GET')) equip = 'GET'
                else if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'RETURN')) equip = 'RETURN'          
                
                return {
                    ...vol,
                    role: 'HCRD',
                    equip,
                    blacklist: foundBlacklistsModel.some(item => item.userId === vol.account.id)
                }
            } else {
                let equip: 'GET' | 'RETURN' | null = null
                
                if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'GET')) equip = 'GET'
                else if(foundEquipmentsModel.some(equip => equip.userId === vol.account.id && equip.status === 'RETURN')) equip = 'RETURN'          

                return {
                    ...vol,
                    role: 'VOL',
                    equip,
                    blacklist: foundBlacklistsModel.some(item => item.userId === vol.account.id)
                }
            }
        })


        return formattedData as (Types.VolunteerData & { 
            role: 'HCRD' | 'CRD' | 'VOL', 
            equip: 'GET' | 'RETURN' | null,
            blacklist: boolean
        })[];
    }

    async getEquip(day: string) {

        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getEquip() before define it')

        // Поиск данных и личной информации волонтера 
        const foundVolunteers = await Associations.VOLUNTEERS_TAB.findAll({ 
            where: { 
                eventId: this.id, 
                day 
            }, 
            include: [{ 
                model: Associations.ACCOUNTS_TAB,
                attributes: ["id", "name", "birthday", "region", "iin", "email", "contactKaspi", "contactWhatsapp"]
             }] })
        const foundVolsModel: (Types.VolunteerData)[] = foundVolunteers.map(vol => vol.get({ plain: true }))

        const ids = foundVolsModel.map(vol => vol.account.id)


        // Поиск информации об экипировке волонтера
        const foundEquipments = await EQUIPMENTS_TAB.findAll({
            where: {
                userId: {
                    [Op.in]: ids
                },
                eventId: this.id,
                day,
                [Op.or]: [
                    { status: 'GET' },
                    { status: 'RETURN' }
                ]
            }
        })

        const foundEquipmentsModel: (Types.Equipment)[] = foundEquipments.map(equip => equip.get({ plain: true }))

        const formattedData = foundEquipmentsModel.map(equip => {
            return {
                provider: foundVolsModel.filter(item => item.account.id === equip.providerId)[0].account.name,
                volunteer: foundVolsModel.filter(item => item.account.id === equip.userId)[0].account.name,
                status: equip.status
            }
        })

        return formattedData as ({ provider: string, volunteer: string, status: 'GET' | 'RETURN' })[]
    }

    async checkDays(days: string[]) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use checkDays() before define it')

        for(const item of days) {
            if(!JSON.parse(this.days as unknown as string).includes(item)) return false
            else return true
        }
    }

    async checkGuilds(guild: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use checkGuilds() before define it')

        if(!JSON.parse(this.guilds as unknown as string).includes(guild)) return false
        else return true
    }

    async getRequestData(isActual = false) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getRequestData() before define it')

        const foundRequests = await Associations.REQUESTS_TAB.findAll({ 
            where: isActual ? { eventId: this.id, status: 'AWAITING' } : { eventId: this.id },
            include: [{ 
                model: Associations.ACCOUNTS_TAB,
                attributes: ["id", "name", "contactWhatsapp"]
             }]
        })

        const foundRequestsModel: (Types.RequestData)[] = foundRequests.map(item => item.get({ plain: true }))

        const ids = foundRequestsModel.map(item => item.account.id)

        const foundPerms = await PERMS_TAB.findAll({ 
            where: {
                userId: {
                    [Op.in]: ids
                },
            }
        })

        const foundPermsModel: (Types.Perms)[] = foundPerms.map(item => item.get({ plain: true }))

        const formattedData = foundRequestsModel.map(item => {
            let perms: 'VOL' | 'CRD' | 'ADMIN' = 'VOL'

            if(foundPermsModel.some(perms => perms.userId === item.account.id && perms.permission === 'ADMIN')) perms = 'ADMIN'
            else if(foundPermsModel.some(perms => perms.userId === item.account.id && perms.permission === 'COORDINATOR')) perms = 'CRD'
            else perms = 'VOL'

            return {
                ...item,
                perms
            }
        })

        return formattedData
    }

    async isCRD(userId: number, ) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use isCRD() before define it')

        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { userId, eventId: this.id } })

        if(foundPerms) return true
        else return false
    }

    async isCRDbyDay(userId: number, day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use isCRDbyDay() before define it')

        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { userId, eventId: this.id, day } })

        if(foundPerms) return true
        else return false
    }

    async isVolunteer(userId: number, day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use isVolunteer() before define it')

        const foundPerms = await VOLUNTEERS_TAB.findOne({ where: { userId, eventId: this.id, day } })

        if(foundPerms) return true
        else return false
    }
    
    async isHCRD(userId: number) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use isHCRD() before define it')

        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { userId, eventId: this.id, permission: 'HCRD' } })

        if(foundPerms) return true
        else return false
    }

    async getPositionsData(day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getPositionsData() before define it')

        const foundPositions = await Associations.POSITIONS_TAB.findAll({ 
            where: { eventId: this.id, day },
            include: [{ 
                model: Associations.VOLUNTEERS_TAB,
                include: [{
                    model: Associations.ACCOUNTS_TAB,
                    attributes: ["id", "name"]
                }]
             }]
        })

        const foundPositionsModel: (Types.PositionData)[] = foundPositions.map(item => item.get({ plain: true }))

        return foundPositionsModel
    }

    async getEquipmentData(day: string) {
        if(!this.id) throw new Error('Module eventClass.ts error: Impossible to use getPositionsData() before define it')

        const foundEquipments = await Associations.EQUIPMENTS_TAB.findAll({ 
            where: { eventId: this.id, day, [Op.or]: [ { status: 'GET' }, { status: 'RETURN' } ] },
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"], as: 'provider' },
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"], as: 'user' }
            ]
        })

        const foundEquipmentsModel: (Types.EquipmentData)[] = foundEquipments.map(item => item.get({ plain: true }))

        return foundEquipmentsModel
    }
}