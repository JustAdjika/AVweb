// DEPENDENCIES
import express from 'express'
import { Op } from 'sequelize'
import ExcelJS from 'exceljs'
import { fileURLToPath } from 'url'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { unlink } from "fs/promises";

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { sendMail } from '../module/emailSend.ts'
import { Event } from '../module/class/eventClass.ts'
import { Request } from '../module/class/requestClass.ts'
import * as arrayCheck from '../module/arrayCheck.ts'
import { GetDateInfo } from '../module/formattingDate.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import EVENTS_TAB from '../database/events.js'

// MIDDLEWARES
import masterKeyCheck from '../middleware/masterKeyCheck.ts'
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
        
        const event = await Event.define()
        await event.update(eventId)

        if(!await event.checkDays(data.days) || !await event.checkGuilds(data.guild)) return sendResponse(res, 400, 'Попытка отправки заявки. Организация или день указаны неверно')

        const newRequest = await Request.create(session.account.id as number, data.guild, eventId, data.days)

        return sendResponse(res, 200, `Попытка отправки заявки. Успешная операция. Заявка на событие ${eventId} отправлена от ${session.account.id}. Заявка ${newRequest.getModel.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/add')
    }
})

router.get('/data', async(req,res) => {
    try {
        const eventId = Number(req.query.eventId)

        if(isNaN(eventId)) return sendResponse(res, 400, 'Попытка получения заявок. Данные указаны неверно')

        
        const event = await Event.define()
        await event.update(eventId)

        const requestData = await event.getRequestData(true)

        return sendResponse(res, 200, `Попытка получения заявок. Успешная операция. Заявки на событие ${eventId} выданы`, { requestData })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/request/add')
    }
})

export default router