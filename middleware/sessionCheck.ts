import SESSIONS_TAB from '../database/sessions'
import ACCOUNTS_TAB from '../database/accounts.js'

import * as Types from '../module/types/types.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'

import bcrypt from 'bcrypt'

const sessionCheck = async(req, res, next) => {
    try {
        const data = req.body

        function isValidData(data: unknown): data is Types.SessionData {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.sessionId, 'number'], 
                    [obj.sessionKey, 'string']
                ])) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'MW sessionCheck. Данные указаны неверно')

        const foundSession = await SESSIONS_TAB.findOne({ where: { id: data.sessionId } })
        if(!foundSession) return sendResponse(res, 404, 'MW sessionCheck. Сессия не найдена')

        const foundSessionModel: Types.Session = foundSession.get({ plain: true })
        if(! await bcrypt.compare(data.sessionKey, foundSessionModel.key)) return sendResponse(res, 403, 'MW sessionCheck. Ключ сессии неверный')

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: foundSessionModel.userId } })
        if(!foundAccount) return sendResponse(res, 404, 'MW sessionCheck. Сессия не связана с пользователем')

        const foundAccountModel: Types.Account = foundAccount.get({ plain: true })
        
        res.locals.sessionCheck = {
            account: foundAccountModel
        }

        next()
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, 'Middleware sessionCheck.ts')
    }
} 

export default sessionCheck