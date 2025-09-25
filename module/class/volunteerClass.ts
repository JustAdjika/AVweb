// DEPENDENCIES
import { Op } from 'sequelize'

// MODULES
import * as Types from '../types/types.ts'

// DATABASE
import VOLUNTEERS_TAB from '../../database/volunteers.js'
import EVENTPERMS_TAB from '../../database/eventPerms.js'
import BLACKLISTS_TAB from '../../database/blacklists.js'
import EQUIPMENTS_TAB from '../../database/equipments.js'

import * as Associations from '../../database/associations.js'

// MIDDLEWARES


export class Volunteer {
    // Data
    private id: number | null = null
    private userId: number | null = null
    private guild: string | null = null
    private visit: boolean = false
    private late: boolean = false
    private eventId: number | null = null
    private day: string | null = null
    private warning: boolean = false
    private inStaffRoom: boolean = false
    private shift: Types.shift = '1st'







    // Constructor
    private constructor(
        id: number | null = null,
        userId: number | null = null,
        guild: string | null = null,
        visit: boolean = false,
        late: boolean = false,
        eventId: number | null = null,
        day: string | null = null,
        warning: boolean = false,
        inStaffRoom: boolean = false,
        shift: Types.shift = '1st'
    ) {
        this.id = id,
        this.userId = userId,
        this.guild = guild,
        this.visit = visit,
        this.late = late,
        this.eventId = eventId,
        this.day = day,
        this.warning = warning,
        this.inStaffRoom = inStaffRoom
        this.shift = '1st'
    }

    static async define() {
        return new Volunteer(
            null,
            null,
            null,
            false,
            false,
            null,
            null,
            false,
            false,
            '1st'
        )
    }

    static async create(userId: number, guild: string, eventId: number, day: string, shift: Types.shift) {
        const foundConflict = await VOLUNTEERS_TAB.findOne({ where: { userId, eventId } })
        if(foundConflict) await foundConflict.destroy()

        const newVolunteer = await VOLUNTEERS_TAB.create({
            userId,
            guild,
            eventId,
            day,
            visit: false,
            late: false,
            warning: false,
            inStaffRoom: false,
            shift
        })

        const newVolunteerModel: Types.Volunteer = await newVolunteer.get({ plain: true })

        return new Volunteer(
            newVolunteerModel.id,
            newVolunteerModel.userId,
            newVolunteerModel.guild,
            false,
            false,
            newVolunteerModel.eventId,
            newVolunteerModel.day,
            false,
            false,
            newVolunteerModel.shift
        )
    }






    // Set data

    async update(id: number | undefined) {
        if(!this.id && !id) throw new Error('Module volunteerClass.ts error: Impossible to use update() before define it or select id')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: id ? { id } : { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: update() undefined currentVolunteer by id')
        const currentVolunteerModel: Types.Volunteer = await currentVolunteer.get({ plain: true })
        
        this.id = currentVolunteerModel.id as number
        this.userId = currentVolunteerModel.userId
        this.guild = currentVolunteerModel.guild
        this.visit = currentVolunteerModel.visit
        this.late = currentVolunteerModel.late
        this.eventId = currentVolunteerModel.eventId
        this.day = currentVolunteerModel.day
        this.warning = currentVolunteerModel.warning
        this.inStaffRoom = currentVolunteerModel.inStaffRoom
        this.shift = currentVolunteerModel.shift
    }

    async changeVisit() {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use changeVisit() before define it')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: changeVisit() undefined instance of object by id')

        this.visit = !this.visit

        currentVolunteer.update({ visit: this.visit })
    }

    async changeLate() {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use changeLate() before define it')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: changeLate() undefined instance of object by id')

        this.late = !this.late

        currentVolunteer.update({ late: this.late })
    }

    async promoteToCRD(preceptorId: number) {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use promoteToCRD() before define it')

        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { eventId: this.eventId, day: this.day, userId: this.userId } })
        if(!foundPerms) {
            await EVENTPERMS_TAB.create({
                userId: this.userId,
                eventId: this.eventId,
                day: this.day,
                permission: 'CRD',
                preceptorId
            })
        } else {
            await foundPerms.update({ permission: 'CRD', preceptorId })
        }
    }

    async reduce() {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use reduce() before define it')

        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { eventId: this.eventId, day: this.day, userId: this.userId } })
        if(!foundPerms) throw new Error('Module volunteerClass.ts error: cant reduce(), user permissions not found')

        await foundPerms.destroy()
    }

    async warn(executerId: number, arg: { force: boolean } = { force: false }, remove: boolean = false) {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use warn() before define it')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: reduce() undefined instance of object by id')

        if(remove) {
            return await currentVolunteer.update({ warning: false })
        }

        if(arg.force) {
            await currentVolunteer.update({ warning: true })
            
            await BLACKLISTS_TAB.create({
                userId: this.userId,
                executerId
            }) 
        } else {
            await currentVolunteer.update({ warning: true })
        }
    }






    // Get data
     
    get getModel() {
        return {
            id: this.id,
            userId: this.userId,
            guild: this.guild,
            visit: this.visit,
            late: this.late,
            eventId: this.eventId,
            day: this.day,
            warning: this.warning,
            inStaffRoom: this.inStaffRoom,
            shift: this.shift
        }
    }

    async getInstance() {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use getInstance() before define it')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: getInstance() undefined instance of object by id')
        return currentVolunteer
    }

    async getVolunteerData() {
        
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use getVolunteerData() before define it')

        // Поиск данных и личной информации волонтера 
        const foundVolunteer = await Associations.VOLUNTEERS_TAB.findOne({ 
            where: { 
                id: this.id
            }, 
            include: [{ 
                model: Associations.ACCOUNTS_TAB,
                attributes: ["id", "name", "birthday", "region", "iin", "email", "contactKaspi", "contactWhatsapp"]
             }] 
        })

        if(!foundVolunteer) throw new Error('Module volunteerClass.ts error: getVolunteerData() cant find the user')

        const foundVolunteerModel: Types.VolunteerData = await foundVolunteer.get({ plain: true })


        // Поиск прав волонтера
        const foundEventPerms = await EVENTPERMS_TAB.findOne({
            where: {
                userId: this.userId,
                eventId: this.eventId,
                day: this.day
            }
        })
        
        let foundEventPermsModel: Types.EventPerms | null = null

        if(foundEventPerms) foundEventPermsModel = await foundEventPerms.get({ plain: true })

        // Поиск информации об экипировке волонтера
        const foundEquipments = await EQUIPMENTS_TAB.findOne({
            where: {
                userId: this.userId,
                eventId: this.eventId,
                day: this.day,
                [Op.or]: [
                    { status: 'GET' },
                    { status: 'RETURN' }
                ]
            }
        })

        let foundEquipmentsModel: Types.Equipment | null = null

        if(foundEquipments) foundEquipmentsModel = await foundEquipments.get({ plain: true })

        // Поиск информации о занесении в ЧС
        const foundBlacklist = await BLACKLISTS_TAB.findOne({
            where: {
                userId: this.userId
            }
        })

        let foundBlacklistModel: Types.Blacklist | null = null

        if(foundBlacklist) foundBlacklistModel = await foundBlacklist.get({ plain: true })


        const formattedData = {
            ...foundVolunteerModel,
            blacklist: foundBlacklist ? true : false,
            role: foundEventPerms ? foundEventPermsModel?.permission : 'VOL',
            equip: foundEquipments ? foundEquipmentsModel?.status : 'NOT EQUIP'
        }

        return formattedData as (Types.VolunteerData & { 
            role: 'HCRD' | 'CRD' | 'VOL', 
            equip: 'GET' | 'RETURN' | 'NOT EQUIP',
            blacklist: boolean
        });
    }
}