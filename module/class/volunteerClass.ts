// DEPENDENCIES
import express from 'express'
import { Op } from 'sequelize'

// MODULES
import * as Types from '../types/types.ts'

// DATABASE
import ACCOUNTS_TAB from '../../database/accounts.js'
import EVENTS_TAB from '../../database/events.js'
import GROUPLINKS_TAB from '../../database/groupLinks.js'
import VOLUNTEERS_TAB from '../../database/volunteers.js'
import EVENTPERMS_TAB from '../../database/eventPerms.js'
import BLACKLISTS_TAB from '../../database/blacklists.js'
import EQUIPMENTS_TAB from '../../database/equipments.js'
import REQUESTS_TAB from '../../database/requests.js'

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
        inStaffRoom: boolean = false
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
            false
        )
    }

    static async create(userId: number, guild: string, eventId: number, day: string) {
        const foundConflict = await VOLUNTEERS_TAB.findOne({ where: { userId, eventId } })
        if(foundConflict) await foundConflict.destroy()

        const newRequest = await VOLUNTEERS_TAB.create({
            userId,
            guild,
            eventId,
            day,
            visit: false,
            late: false,
            warning: false,
            inStaffRoom: false
        })

        const newRequestModel: Types.Volunteer = await newRequest.get({ plain: true })

        return new Volunteer(
            newRequestModel.id,
            newRequestModel.userId,
            newRequestModel.guild,
            false,
            false,
            newRequestModel.eventId,
            newRequestModel.day,
            false,
            false
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
        }
    }

    async getInstance() {
        if(!this.id) throw new Error('Module volunteerClass.ts error: Impossible to use getInstance() before define it')

        const currentVolunteer = await VOLUNTEERS_TAB.findOne({ where: { id: this.id } })
        if(!currentVolunteer) throw new Error('Module volunteerClass.ts error: getInstance() undefined instance of object by id')
        return currentVolunteer
    }
}