// DEPENDENCIES
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { Event } from '../module/class/eventClass.ts'
import { Volunteer } from '../module/class/volunteerClass.ts'

// DATABASE

// MIDDLEWARES
import masterKeyCheck from '../middleware/masterKeyCheck.ts'
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

router.patch('/visit/change/:volunteerId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const permsDay = req.body.eventPerms.day
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const volunteerId = Number(req.params.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка смены посещения волонтера. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка смены посещения волонтера. Данные указаны неверно')

        if(perms.perms === 'Unexpected' || perms.perms === 'VOL') return sendResponse(res, 403, 'Попытка смены посещения волонтера. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        if(permsDay !== volunteer.getModel.day) return sendResponse(res, 403, 'Попытка смены посещения волонтера. Недостаточно прав')

        await volunteer.changeVisit()

        return sendResponse(
            res, 
            200, 
            `Попытка смены посещения волонтера. Успешная операция. Выставлено ${ volunteer.getModel.visit ? 'Посещение' : 'Отсутствие' } ${ volunteer.getModel.id } ${ perms.perms } ${ session.account.id }`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/visit/change')
    }
})

router.patch('/late/change/:volunteerId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck
        const permsDay = req.body.eventPerms.day
        
        const volunteerId = Number(req.params.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка смены опоздания волонтера. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка смены опоздания волонтера. Данные указаны неверно')

        if(perms.perms === 'VOL' || perms.perms === 'Unexpected') return sendResponse(res, 403, 'Попытка смены опоздания волонтера. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        if(permsDay !== volunteer.getModel.day) return sendResponse(res, 403, 'Попытка смены опоздания волонтера. Недостаточно прав')

        await volunteer.changeLate()

        return sendResponse(
            res, 
            200, 
            `Попытка смены опоздания волонтера. Успешная операция. Выставлено ${ volunteer.getModel.late ? 'Опоздание' : 'Вовремя' } ${ volunteer.getModel.id } ${ perms.perms } ${ session.account.id }`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/late/change')
    }
})

router.patch('/promote/CRD/:volunteerId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const volunteerId = Number(req.params.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка повышения до CRD. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка повышения до CRD. Данные указаны неверно')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка повышения до CRD. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        await volunteer.promoteToCRD(session.account.id as number)

        return sendResponse(res, 200, `Попытка повышения до CRD. Успешная операция. ${ volunteer.getModel.id } повышен до Координатора ${perms.perms} ${ session.account.id }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/promote/CRD')
    }
})

router.patch('/reduce/:volunteerId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const volunteerId = Number(req.params.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка понижения до VOL. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка понижения до VOL. Данные указаны неверно')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка понижения до VOL. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        await volunteer.reduce()

        return sendResponse(res, 200, `Попытка понижения до VOL. Успешная операция. ${ volunteer.getModel.id } понижен до Волонтера ${perms.perms} ${ session.account.id }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/reduce')
    }
})

router.post('/promote/HCRD', masterKeyCheck, async(req,res) => {
    try {
        const userId = Number(req.query.userId)
        const eventId = Number(req.query.eventId)

        if(isNaN(userId) || isNaN(eventId)) return sendResponse(res, 400, 'Попытка добавления HCRD. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventId)

        await event.addHCRD(userId)

        return sendResponse(res, 200, `Попытка добавления HCRD. Успешная операция. HCRD ${userId} успешно добавлен в событие ${eventId}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/promote/HCRD')
    }
})

router.patch('/warn', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck
        const permsDay = req.body.eventPerms.day

        const volunteerId = Number(req.query.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка смены предупреждения. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка смены предупреждения. Данные указаны неверно')

        if(perms.perms === 'VOL' || perms.perms === 'Unexpected') return sendResponse(res, 403, 'Попытка смены предупреждения. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        if(permsDay !== volunteer.getModel.day) return sendResponse(res, 403, 'Попытка смены предупреждения. Недостаточно прав')

        if(volunteer.getModel.warning) await volunteer.warn(session.account.id as number, { force: false }, true)
        else await volunteer.warn(session.account.id as number)
        

        return sendResponse(
            res, 
            200, 
            `Попытка смены предупреждения. Успешная операция. Предупреждение ${volunteer.getModel.warning ? 'Выдано' : 'Снято с'} ${volunteerId} ${perms.perms} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/warn')
    }
})

router.post('/data/all/:eventId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck
        const permsDay = req.body.eventPerms.day

        const eventId = Number(req.params.eventId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения волонтеров. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(eventId)) return sendResponse(res, 400, 'Попытка получения волонтеров. Данные указаны неверно')

        if(perms.perms === 'VOL' || perms.perms === 'Unexpected') return sendResponse(res, 403, 'Попытка получения волонтеров. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventId)

        const volData = await event.getVolunteersData(permsDay)
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения волонтеров. Успешная операция. Список выдан для ${session.account.id} по событию ${eventId} на день ${permsDay}`,
            volData
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/data/all')
    }
})

router.post('/data/:volunteerId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const volunteerId = Number(req.params.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения волонтера. MW sessionCheck/eventPermsCheck не передал необходимые данные')
        if(isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка получения волонтера. Данные указаны неверно')

        if(perms.perms === 'VOL' || perms.perms === 'Unexpected') return sendResponse(res, 403, 'Попытка получения волонтера. Недостаточно прав')

        const volunteer = await Volunteer.define()
        await volunteer.update(volunteerId)

        const volData = await volunteer.getVolunteerData()
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения волонтера. Успешная операция. Волонтер ${volunteerId} выдан для ${session.account.id}`, 
            volData
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/volunteer/data')
    }
})


export default router