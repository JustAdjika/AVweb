// DEPENDENCIES
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { Event } from '../module/class/eventClass.ts'
import { Equipment } from '../module/class/equipClass.ts';

// DATABASE

// MIDDLEWARES
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

router.patch('/qr/get/scan', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const token = req.query.token
        const equipId = Number(req.query.equipId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка сканирования QR получения экипа. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD') return sendResponse(res, 403, 'Попытка сканирования QR получения экипа. Недостаточно прав')

        if(typeof token !== 'string' || isNaN(equipId)) return sendResponse(res, 400, 'Попытка сканирования QR получения экипа. Входные данные указаны неверно')

        const equipment = await Equipment.define()
        await equipment.update(equipId)

        await equipment.getEquip(token, session.account.id as number, eventPermsData.eventId, eventPermsData.day)
        
        return sendResponse(
            res, 
            200, 
            `Попытка сканирования QR получения экипа. Успешная операция. ${perms.perms} ${session.account.id} сканировал QR GET EQUIP ${equipId}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/equipment/qr/get/scan')
    }
})

router.patch('/qr/return/scan', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const userId = Number(req.query.userId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка сканирования QR сдачи экипа. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка сканирования QR сдачи экипа. Входные данные указаны неверно')

        const equipment = await Equipment.define()
        await equipment.getLastEquip(userId)

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD' || eventPermsData.day !== equipment.getModel.day) return sendResponse(res, 403, 'Попытка сканирования QR сдачи экипа. Недостаточно прав')

        await equipment.returnEquip(userId)
        
        return sendResponse(
            res, 
            200, 
            `Попытка сканирования QR сдачи экипа. Успешная операция. ${perms.perms} ${session.account.id} сканировал QR RETURN EQUIP ${equipment.getModel.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/equipment/qr/return/scan')
    }
})

router.post('/data/all', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения всех экипов. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD') return sendResponse(res, 403, 'Попытка получения всех экипов. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        const equipData = await event.getEquipmentData(eventPermsData.day)
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения всех экипов. Успешная операция. ${perms.perms} ${session.account.id} получил все экипы за ${eventPermsData.eventId} событие ${eventPermsData.day} день`,
            equipData
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/equipment/data/all')
    }
})

router.post('/data/:equipId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const equipId = Number(req.params.equipId)

        if(isNaN(equipId)) return sendResponse(res, 400, 'Попытка получения экипа. Входные данные указаны неверно')

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения экипа. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        const equip = await Equipment.define()
        await equip.update(equipId)

        if(perms.perms !== 'HCRD' && !(perms.perms === 'CRD' && eventPermsData.day === equip.getModel.day) && session.account.id !== equip.getModel.userId) return sendResponse(res, 403, 'Попытка получения экипа. Недостаточно прав')

        const equipData = equip.getModel
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения экипа. Успешная операция. ${perms.perms} ${session.account.id} экип ${equipId}`,
            equipData
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/equipment/data')
    }
})

router.patch('/return/force', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const userId = Number(req.query.userId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка принудительной сдачи экипа. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка принудительной сдачи экипа. Входные данные указаны неверно')

        const equipment = await Equipment.define()
        await equipment.getLastEquip(userId)

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD' || eventPermsData.day !== equipment.getModel.day) return sendResponse(res, 403, 'Попытка принудительной сдачи экипа. Недостаточно прав')

        await equipment.returnEquip(userId, { force: true })
        
        return sendResponse(
            res, 
            200, 
            `Попытка принудительной сдачи экипа. Успешная операция. ${perms.perms} ${session.account.id} принудительно сдал ${equipment.getModel.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/equipment/return/force')
    }
})

export default router