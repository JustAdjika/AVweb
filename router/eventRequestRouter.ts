// DEPENDENCIES
import express from 'express'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { Event } from '../module/class/eventClass.ts'
import { Request } from '../module/class/requestClass.ts'
import * as arrayCheck from '../module/arrayCheck.ts'

// DATABASE

// MIDDLEWARES
import sessionCheck from '../middleware/sessionCheck.ts'

const router = express.Router()
const config = new Config()


router.post('/add', sessionCheck, async(req,res) => {
    try {
        interface dataType {
            guild: string,
            days: string[]
        }

        const session = res.locals.sessionCheck as Types.localSessionCheck

        const eventId = Number(req.query.eventId)

        if(!session) return sendResponse(res, 500, 'Попытка отправки заявки. MW sessionCheck не передал необходимые данные')
        if(isNaN(eventId)) return sendResponse(res, 400, 'Попытка отправки заявки. Данные указаны неверно')

        const data = req.body
        
        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.guild, 'string'],
                    [obj.days, 'object'], 
                ])) {
                    return arrayCheck.isStringArray(obj.days)
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка отправки заявки. Данные указаны неверно')

        if(data.days.length === 0) return sendResponse(res, 400, 'Попытка отправки заявки. Нужно выбрать хотя бы один день')
        
        const event = await Event.define()
        await event.update(eventId)

        if(!await event.checkDays(data.days) || !await event.checkGuilds(data.guild)) return sendResponse(res, 400, 'Попытка отправки заявки. Организация или день указаны неверно')

        const newRequest = await Request.create(session.account.id as number, data.guild, eventId, data.days)

        return sendResponse(res, 200, `Попытка отправки заявки. Успешная операция. Заявка на событие ${eventId} отправлена от ${session.account.id}. Заявка ${newRequest.getModel.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/add')
    }
})

router.get('/data/actual', async(req,res) => {
    try {
        const eventId = Number(req.query.eventId)

        if(isNaN(eventId)) return sendResponse(res, 400, 'Попытка получения заявок. Данные указаны неверно')

        
        const event = await Event.define()
        await event.update(eventId)

        const requestData = await event.getRequestData(true)

        return sendResponse(res, 200, `Попытка получения заявок. Успешная операция. Заявки на событие ${eventId} выданы`, { requestData })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/data/actual')
    }
})

router.get('/data/:requestId', async(req,res) => {
    try {
        const requestId = Number(req.params.requestId)

        if(isNaN(requestId)) return sendResponse(res, 400, 'Попытка получения информации о заявке. Данные указаны неверно')
        
        const request = await Request.define()
        await request.update(requestId)

        const requestData = request.getModel

        return sendResponse(res, 200, `Попытка получения информации о заявке. Успешная операция. Заявка ${requestId} выдана`, { requestData })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/data')
    }
})

router.post('/solution/:option/:requestId', sessionCheck, async(req,res) => {
    try {
        const requestId = Number(req.params.requestId)
        const option = req.params.option
        const days = req.body.days

        const session = res.locals.sessionCheck as Types.localSessionCheck

        const reason = req.body.reason

        if(isNaN(requestId) || ( option !== 'accept' && option !== 'denied' ) || !arrayCheck.isStringArray(days) || ( option === 'denied' && !reason )) return sendResponse(res, 400, 'Попытка решения заявки. Данные указаны неверно')

        if(!session) return sendResponse(res, 500, 'Попытка решения заявки. MW eventPermsCheck/sessionCheck не передал необходимые данные')
        
        if(days.length === 0 ) return sendResponse(res, 400, 'Попытка решения заявки. Нужно выбрать хотя бы один день')

        const request = await Request.define()
        await request.update(requestId)

        const event = await Event.define()
        await event.update(request.getModel.eventId as number)

        if(!await event.isCRD(session.account.id as number)) return sendResponse(res, 403, 'Попытка решения заявки. Недостаточно прав')

        if(option === 'accept') await request.accept(days)
        else await request.denied(reason)

        return sendResponse(res, 200, `Попытка решения заявки. Успешная операция. Заявка ${requestId} ${option === 'accept' ? 'Одобрена' : 'Отклонена'} координатором ${session.account.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/solution')
    }
})


export default router