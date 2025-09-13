// DEPENDENCIES
import express from 'express'
import { Op } from 'sequelize'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { sendMail } from '../module/emailSend.ts'
import { Event } from '../module/eventClass.ts'
import * as arrayCheck from '../module/arrayCheck.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import EVENTS_TAB from '../database/events.js'

// MIDDLEWARES
import masterKeyCheck from '../middleware/masterKeyCheck.ts'
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

router.post('/create', masterKeyCheck, async(req,res) => {
    try {
        interface dataType {
            name: string,
            guilds: string[],
            days: string[]
        }

        const data = req.body
        
        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.name, 'string'],
                    [obj.days, 'object'],
                    [obj.guilds, 'object'], 
                ])) {
                    if(arrayCheck.isStringArray(obj.days) && arrayCheck.isStringArray(obj.guilds)) return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка создания события. Данные указаны неверно')
        
        const newEvent = await Event.create(data.name, data.guilds, data.days)

        return sendResponse(res, 200, `Попытка создания события. Успешная операция. Новое событие создано под id ${newEvent.getModel.id} MASTERKEY`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/create')
    }
})

router.get('/data/:method', async(req,res) => {
    try {
        const method = req.params.method
        const { name, id } = req.query
        const eventId = Number(req.query.id)

        if(!method || ( method !== 'byId' && method !== 'byName' ) ) return sendResponse(res, 400, 'Попытка поиска события. Метод не указан или указан неверно')
        if( (typeof name !== "string" || !name.trim()) && (!id || isNaN(eventId)) ) return sendResponse(res, 400, 'Попытка поиска события. Данные указаны неверно')


        let foundEvent = undefined
        if(method === 'byId') {
            foundEvent = await EVENTS_TAB.findOne({ where: { id } }) 
        } else {
            foundEvent = await EVENTS_TAB.findOne({ where: { name } })
        }

        if(!foundEvent) return sendResponse(res, 404, 'Попытка поиска события. Событие не найдено')

        const foundEventModel: Types.Event = await foundEvent.get({ plain: true }) 

        return sendResponse(res, 200, `Попытка поиска события. Успешная операция. Найдено событие ${foundEventModel.id}`, { event: foundEvent } )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/data')
    }
})

router.post('/linkadd', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const link = req.body.link
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка смены ссылки. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка смены ссылки. Недостаточно прав')

        if(typeof link !== 'string') return sendResponse(res, 400, 'Попытка смены ссылки. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        event.setLink(eventPermsData.day, link)

        return sendResponse(res, 200, `Попытка смены ссылки. Успешная операция. Ссылка на день ${eventPermsData.day} события ${eventPermsData.eventId} изменена HCRD ${session.account.id} на ${link}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/linkadd')
    }
})

router.put('/info/update', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const infoObject = req.body.info
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка обновления информации события. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка обновления информации события. Недостаточно прав')

        function isValidData(data: unknown): data is Types.eventInfoObject {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.dressCode, 'object'],
                    [obj.behavior, 'object'],
                    [obj.rules, 'object'], 
                ])) {
                    if(arrayCheck.isStringArrayArray(obj.behavior) && arrayCheck.isStringArrayArray(obj.rules)) {
                        if(obj.dressCode !== null) {
                            const obj2 = obj.dressCode as Record<string, unknown>

                            if(dataCheck([
                                [obj2.accept, 'object'],
                                [obj2.deny, 'object'],
                            ])) {
                                if(arrayCheck.isStringArray(obj2.accept) && arrayCheck.isStringArray(obj2.deny)) {
                                    return true
                                }
                            } 
                        }
                    }
                } 
            }
            return false
        }

        if(!isValidData(infoObject)) return sendResponse(res, 400, 'Попытка обновления информации события. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        event.newInfo = infoObject

        return sendResponse(res, 200, `Попытка обновления информации события. Успешная операция. Информация о событии ${eventPermsData.eventId} изменена HCRD ${session.account.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, 'event/info/update')
    }
})

router.put('/uniqueinfo/update', masterKeyCheck, async(req,res) => {
    try {
        const infoObject = req.body.info
        const eventId = req.body.eventId

        if(typeof infoObject !== 'object' || typeof eventId !== 'number') return sendResponse(res, 400, 'Попытка обновления уникальной информации события. Данные указаны неверно')
        
        const event = await Event.define()
        await event.update(eventId)

        event.newUniqueInfo = infoObject

        return sendResponse(res, 200, `Попытка обновления уникальной информации события. Успешная операция. Изменено MASTERKEY`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/uniqueinfo/update')
    }
})

router.patch('/register/change', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка изменения статуса регистрации. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка изменения статуса регистрации. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        await event.changeRegister()

        return sendResponse(res, 200, `Попытка изменения статуса регистрации. Успешная операция. Регистрация успешно ${ event.getModel.isRegisterOpen ? 'открыта' : 'закрыта' } HCRD ${ session.account.id }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, 'event/register/change')
    }
})

export default router