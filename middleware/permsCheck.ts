import PERMS_TAB from '../database/perms.js'

import { sendResponse } from '../module/response.ts'
import * as Types from '../module/types/types.ts' 

const permsCheck = async(req, res, next) => {
    try {
        const data = res.locals.sessionCheck.account as Types.Account

        if(!res.locals.sessionCheck.account.id) return sendResponse(res, 500, 'MW permsCheck. MW sessionCheck не передал пользователя')

        const foundPerms = await PERMS_TAB.findOne({ where: { userId: data.id } })

        let returnData: Types.localPermsCheck = { perms: 'USER' }

        if(!foundPerms) {
            returnData.perms = 'USER'
        } else {
            const foundPermsModel: Types.Perms = foundPerms.get({ plain: true })

            if(foundPermsModel.permission === 'COORDINATOR') returnData.perms = 'COORDINATOR'
            else if(foundPermsModel.permission === 'ADMIN') returnData.perms = 'ADMIN'
            else sendResponse(res, 500, 'MW permsCheck. У пользователя не указан уровень прав')
        }

        res.locals.permsCheck = returnData
        next()
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, 'Middleware sessionCheck.ts')
    }
} 

export default permsCheck