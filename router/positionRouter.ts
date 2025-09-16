// DEPENDENCIES
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import { writeFile } from "fs/promises";

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { Event } from '../module/class/eventClass.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { Position } from '../module/class/positionClass.ts'

// DATABASE

// MIDDLEWARES
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.post('/add', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        interface dataType {
            name: string,
            count: number,
            location: string
        }

        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const data = req.body

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.name, 'string'],
                    [obj.count, 'number'],
                    [obj.location, 'string'], 
                ])) {
                    return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка добавления позиции. Данные указаны неверно')

        if(!session || !perms) return sendResponse(res, 500, 'Попытка добавления позиции. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка добавления позиции. Недостаточно прав')

        const position = await Position.create(data.name, data.count, eventPermsData.eventId, eventPermsData.day, data.location)
        
        return sendResponse(
            res, 
            200, 
            `Попытка добавления позиции. Успешная операция. HCRD ${session.account.id} создал позицию '${data.name}' в количестве ${data.count}. День ${eventPermsData.day}, событие ${eventPermsData.eventId}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/add')
    }
})

router.post('/data/all', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения позиций. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD') return sendResponse(res, 403, 'Попытка получения позиций. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        const positions = await event.getPositionsData(eventPermsData.day)
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения позиций. Успешная операция. ${perms.perms} ${session.account.id} получил позиции к ${eventPermsData.eventId}`,
            positions
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/data/all')
    }
})

router.post('/data/:positionId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.params.positionId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения позиции. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId)) return sendResponse(res, 400, 'Попытка получения позиции. Данные указаны неверно')

        const position = await Position.define()
        await position.update(positionId)

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD' && session.account.id !== position.getModel.volunteerId || position.getModel.day !== eventPermsData.day) {
            return sendResponse(res, 403, 'Попытка получения позиции. Недостаточно прав')
        }
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения позиций. Успешная операция. ${perms.perms} ${session.account.id} получил позицию ${positionId}`,
            position.getModel
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/data')
    }
})

router.post('/data/mapMarker/:marker', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const marker = req.params.marker

        if(!session || !perms) return sendResponse(res, 500, 'Попытка получения позиций маркера. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(!marker || typeof marker !== 'string') return sendResponse(res, 400, 'Попытка получения позиций маркера. Данные указаны неверно')

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD') return sendResponse(res, 403, 'Попытка получения позиций маркера. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        const positions = await event.getMarkerPos(marker as Types.mapMarker, eventPermsData.day)
        
        return sendResponse(
            res, 
            200, 
            `Попытка получения позиций маркера. Успешная операция. ${perms.perms} ${session.account.id} получил позиции события ${eventPermsData.eventId} по маркеру ${marker}`,
            positions
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/data/mapMarker')
    }
})

router.patch('/location/update', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.query.positionId)

        const locationText = req.body.location


        if(!session || !perms) return sendResponse(res, 500, 'Попытка обновления локации. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId) && typeof locationText === 'string') return sendResponse(res, 400, 'Попытка обновления локации. Данные указаны неверно')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка обновления локации. Недостаточно прав')

        const position = await Position.define()
        await position.update(positionId)

        await position.changeLocation(locationText)
        
        return sendResponse(
            res, 
            200, 
            `Попытка обновления локации. Успешная операция. Локация позиции ${positionId} обновлена HCRD ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/location/update')
    }
})

router.delete('/destroy', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.query.positionId)


        if(!session || !perms) return sendResponse(res, 500, 'Попытка удаления позиции. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId)) return sendResponse(res, 400, 'Попытка удаления позиции. Данные указаны неверно')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка удаления позиции. Недостаточно прав')

        const position = await Position.define()
        await position.update(positionId)

        const backupData = position.getModel
        const backupName = `positionBackup_${backupData.id}.json`
        
        const backupPath = __dirname + `/..${config.backupPath}/` + backupName

        await writeFile(backupPath, JSON.stringify(backupData, null, 2))

        await position.destroy()
        
        return sendResponse(
            res, 
            200, 
            `Попытка удаления позиции. Успешная операция. Локация позиции ${positionId} удалена HCRD ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/destroy')
    }
})

router.patch('/volunteer/set', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.query.positionId)
        const volunteerId = Number(req.query.volunteerId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка назначения волонтера. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId) && isNaN(volunteerId)) return sendResponse(res, 400, 'Попытка назначения волонтера. Данные указаны неверно')

        const position = await Position.define()
        await position.update(positionId)

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD' || position.getModel.day !== eventPermsData.day) return sendResponse(res, 403, 'Попытка назначения волонтера. Недостаточно прав')

        await position.setVolunteer(volunteerId)
        
        return sendResponse(
            res, 
            200, 
            `Попытка назначения волонтера. Успешная операция. Волонтер ${volunteerId} назначен на ${positionId} ${perms.perms === 'HCRD' ? 'Гл. Координатором' : 'Координатором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/volunteer/set')
    }
})

router.patch('/marker/set', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.query.positionId)
        const marker = req.query.marker

        if(!session || !perms) return sendResponse(res, 500, 'Попытка назначения маркера. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId) && typeof marker ==='string') return sendResponse(res, 400, 'Попытка назначения маркера. Данные указаны неверно')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка назначения маркера. Недостаточно прав')

        const position = await Position.define()
        await position.update(positionId)

        await position.setMarker(marker as Types.mapMarker)
        
        return sendResponse(
            res, 
            200, 
            `Попытка назначения маркера. Успешная операция. Позиции ${positionId} назначен маркер ${marker} HCRD ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/marker/set')
    }
})

router.patch('/clear/:positionId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const positionId = Number(req.params.positionId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка снятия волонтера. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(isNaN(positionId)) return sendResponse(res, 400, 'Попытка снятия волонтера. Данные указаны неверно')

        const position = await Position.define()
        await position.update(positionId)

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD' || eventPermsData.day !== position.getModel.day) return sendResponse(res, 403, 'Попытка снятия волонтера. Недостаточно прав')

        await position.removeVolunteer()
        
        return sendResponse(
            res, 
            200, 
            `Попытка снятия волонтера. Успешная операция. С позиции ${positionId} снят волонтер ${perms.perms === 'HCRD' ? 'Гл. Координатором' : 'Координатором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/clear')
    }
})

router.patch('/marker/clear/:eventId/:marker', sessionCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck

        const marker = req.params.marker
        const eventId = Number(req.params.eventId)

        if(!session) return sendResponse(res, 500, 'Попытка очистки маркера. MW sessionCheck/eventPermsCheck не передал необходимые данные')

        if(typeof marker !== 'string' && isNaN(eventId)) return sendResponse(res, 400, 'Попытка очистки маркера. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventId)

        if(!await event.isCRD(session.account.id as number)) return sendResponse(res, 403, 'Попытка очистки маркера. Недостаточно прав')

        await event.clearPosition(marker as Types.mapMarker)
        
        return sendResponse(
            res, 
            200, 
            `Попытка очистки маркера. Успешная операция. Маркер ${marker} события ${eventId} очищен ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/position/clear')
    }
})

export default router