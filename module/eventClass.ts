// DEPENDENCIES
import express from 'express'
import { Op } from 'sequelize'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { sendMail } from '../module/emailSend.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import EVENTS_TAB from '../database/events.js'
import GROUPLINKS_TAB from '../database/groupLinks.js'

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
        this.info = object

        EVENTS_TAB.findOne({ where: { id: this.id } }).then(currentEvent => {
            if(!currentEvent) throw new Error('Module eventClass.ts error: newInfo undefined currentEvent by id')
            
            currentEvent.update({ info: object })
        })
    }

    set newUniqueInfo(object: object) {
        this.uniqueInfo = object

        EVENTS_TAB.findOne({ where: { id: this.id } }).then(currentEvent => {
            if(!currentEvent) throw new Error('Module eventClass.ts error: newUniqueInfo undefined currentEvent by id')
            
            currentEvent.update({ uniqueInfo: object })
        })
    }

    async changeRegister() {
        this.isRegisterOpen = !this.isRegisterOpen

        const currentEvent = await EVENTS_TAB.findOne({ where: { id: this.id } })
        if(!currentEvent) throw new Error('Module eventClass.ts error: changeRegister() undefined currentEvent by id')
        await currentEvent.update({ isRegisterOpen: this.isRegisterOpen })
    }

    async update(id: number | undefined) {
        if(id) {
            const currentEvent = await EVENTS_TAB.findOne({ where: { id: id } })
            if(!currentEvent) throw new Error('Module eventClass.ts error: update() undefined currentEvent by id')
            const currentEventModule: Types.Event = await currentEvent.get({ plain: true })
            
            this.id = currentEventModule.id as number,
            this.name = currentEventModule.name,
            this.guilds = currentEventModule.guilds,
            this.days = currentEventModule.days
            this.isRegisterOpen = currentEventModule.isRegisterOpen
            this.info = currentEventModule.info as Types.eventInfoObject
            this.uniqueInfo = currentEventModule.uniqueInfo
        } else {
            const currentEvent = await EVENTS_TAB.findOne({ where: { id: this.id } })
            if(!currentEvent) throw new Error('Module eventClass.ts error: update() undefined currentEvent by id')
            const currentEventModule: Types.Event = await currentEvent.get({ plain: true })
            
            this.id = currentEventModule.id as number,
            this.name = currentEventModule.name,
            this.guilds = currentEventModule.guilds,
            this.days = currentEventModule.days
            this.isRegisterOpen = currentEventModule.isRegisterOpen
            this.info = currentEventModule.info as Types.eventInfoObject
            this.uniqueInfo = currentEventModule.uniqueInfo
        }
    }

    setLink(day: string, link: string) {
        GROUPLINKS_TAB.findOne({ where: { eventId: this.id, day } }).then(currentLink => {
            if(!currentLink) throw new Error('Module eventClass.ts error: setLink undefined link by day')
            
            currentLink.update({ link })
        })
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
        const currentEvent = await EVENTS_TAB.findOne({ where: { id: this.id } })
        if(!currentEvent) throw new Error('Module eventClass.ts error: getInstance() undefined instance of object by id')
        return currentEvent
    }

    async getLink(day: string) {
        const foundLink = await GROUPLINKS_TAB.findOne({ where: { eventId: this.id, day } })
        if(!foundLink) throw new Error('Module eventClass.ts error: getLink() undefined link by day')
        const foundLinkModel: Types.GroupLink = await foundLink.get({ plain: true })
        return foundLinkModel.link
    }
}