import MASTERKEYS_TAB from '../database/masterKeys.js'

import { sendResponse } from '../module/response.ts'
import * as Types from '../module/types/types.ts' 
import type { Request, Response, NextFunction } from 'express'

const masterKeyCheck = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body

        if(!data || typeof data.masterKey !== 'string') return sendResponse(res, 400, 'MW masterKeyCheck. Данные указаны неверно')

        const now = new Date()
        const foundKey = await MASTERKEYS_TAB.findOne({ where: { key: data.masterKey } })
        if(!foundKey) return sendResponse(res, 403, 'MW masterKeyCheck. Мастер ключ не найден') 

        const foundKeyModel: Types.MasterKey = foundKey.get({ plain: true })
        if(foundKeyModel.expiresAt < now) return sendResponse(res, 498, 'MW masterKeyCheck. Мастер ключ просрочен')

        next()
    } catch (e: any) {
        return sendResponse(res, 500, e.message, undefined, 'Middleware masterKeyCheck.ts')
    }
} 

export default masterKeyCheck