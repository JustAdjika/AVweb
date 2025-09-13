import type { Request, Response, NextFunction } from 'express'

import { sendResponse } from '../module/response.ts'
import * as Types from '../module/types/types.ts' 
import { dataCheck } from '../module/dataCheck.ts'

import EVENTPERMS_TAB from '../database/eventPerms.js'
import VOLUNTEERS_TAB from '../database/volunteers.js'

const eventPermsCheck = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const data = res.locals.sessionCheck?.account as Types.Account
        const requestData = req.body.eventPerms

        if(!res.locals.sessionCheck?.account.id) return sendResponse(res, 500, 'MW eventPermsCheck. MW sessionCheck не передал пользователя')

        function isValidData(data: unknown): data is Types.eventPermsData {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.day, 'string'], 
                    [obj.eventId, 'number']
                ])) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(requestData)) return sendResponse(res, 400, 'MW eventPermsCheck. Данные указаны неверно')

        // console.log(`data:`, requestData)

        const foundVolunteer = await VOLUNTEERS_TAB.findOne({ where: { userId: data.id, day: requestData.day, eventId: requestData.eventId } })
        const foundPerms = await EVENTPERMS_TAB.findOne({ where: { userId: data.id, day: requestData.day, eventId: requestData.eventId } })

        // console.log(`foundVol:`, foundVolunteer)
        // console.log(`foundP:`, foundPerms)

        let returnData: Types.localEventPermsCheck = { perms: 'Unexpected' }

        if(foundVolunteer && foundPerms) {
            const foundPermsModel: Types.EventPerms = foundPerms.get({ plain: true })

            if(foundPermsModel.permission === 'HCRD') returnData.perms = 'HCRD'
            else if(foundPermsModel.permission === 'CRD') returnData.perms = 'CRD'
            else sendResponse(res, 500, 'MW eventPermsCheck. У пользователя не указан уровень прав')
        } else if(foundVolunteer && !foundPerms) {
            returnData.perms = 'VOL'
        }

        res.locals.eventPermsCheck = returnData
        next()
    } catch (e: any) {
        return sendResponse(res, 500, e.message, undefined, 'Middleware eventPermsCheck.ts')
    }
} 

export default eventPermsCheck