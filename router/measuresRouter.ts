// DEPENDENCIES
import express from 'express'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import BLACKLISTS_TAB from '../database/blacklists.js'
import REQUESTBLACKLISTS_TAB from '../database/requestBlacklists.js'
import EVENTS_TAB from '../database/events.js'

import * as Associations from '../database/associations.js'

// MIDDLEWARES
import sessionCheck from '../middleware/sessionCheck.ts'
import permsCheck from '../middleware/permsCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()


// ЧС
router.post('/blacklist/add/:userId', sessionCheck, permsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localPermsCheck = res.locals.permsCheck

        const userId = Number(req.params.userId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка занесения в ЧС. MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'COORDINATOR' && perms.perms !== 'ADMIN') return sendResponse(res, 403, 'Попытка занесения в ЧС. Недостаточно прав')

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка занесения в ЧС. Входные данные указаны неверно')

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: userId } })
        if(!foundAccount) return sendResponse(res, 404, 'Попытка занесения в ЧС. Пользователь не найден')

        const foundConflict = await BLACKLISTS_TAB.findOne({ where: { userId } })
        if(foundConflict) return sendResponse(res, 409, 'Попытка занесения в ЧС. Пользователь уже в ЧС')

        const newBlacklist = await BLACKLISTS_TAB.create({ 
            userId,
            executerId: session.account.id
        })
        
        return sendResponse(
            res, 
            200, 
            `Попытка занесения в ЧС. Успешная операция. Пользователь ${userId} добавлен в черный список ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/blacklist/add')
    }
})

router.delete('/blacklist/remove/userId', sessionCheck, permsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localPermsCheck = res.locals.permsCheck

        const userId = Number(req.query.userId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка удаления из ЧС (UserId). MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'COORDINATOR' && perms.perms !== 'ADMIN') return sendResponse(res, 403, 'Попытка удаления из ЧС (UserId). Недостаточно прав')

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка удаления из ЧС (UserId). Входные данные указаны неверно')

        const foundBlacklist = await BLACKLISTS_TAB.findOne({ where: { userId } })
        if(!foundBlacklist) return sendResponse(res, 404, 'Попытка удаления из ЧС (UserId). Пользователь не найден')

        await foundBlacklist.destroy()
        
        return sendResponse(
            res, 
            200, 
            `Попытка удаления из ЧС (UserId). Успешная операция. Пользователь ${userId} убран из ЧС ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/blacklist/remove/userId')
    }
})

router.delete('/blacklist/remove/blId', sessionCheck, permsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localPermsCheck = res.locals.permsCheck

        const blId = Number(req.query.blId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка удаления из ЧС (blId). MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'COORDINATOR' && perms.perms !== 'ADMIN') return sendResponse(res, 403, 'Попытка удаления из ЧС (blId). Недостаточно прав')

        if(isNaN(blId)) return sendResponse(res, 400, 'Попытка удаления из ЧС (blId). Входные данные указаны неверно')

        const foundBlacklist = await BLACKLISTS_TAB.findOne({ where: { id: blId } })
        if(!foundBlacklist) return sendResponse(res, 404, 'Попытка удаления из ЧС (blId). Пользователь не найден')

        const foundBlacklistModel: Types.Blacklist = await foundBlacklist.get({ plain: true }) 

        await foundBlacklist.destroy()
        
        return sendResponse(
            res, 
            200, 
            `Попытка удаления из ЧС (blId). Успешная операция. Пользователь ${foundBlacklistModel.userId} убран из ЧС ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/blacklist/remove/blId')
    }
})

router.get('/blacklist/check', async(req,res) => {
    try {
        const userId = Number(req.query.userId)

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка проверки на ЧС. Входные данные указаны неверно')

        const foundBlacklist = await Associations.BLACKLISTS_TAB.findOne({ 
            where: { userId },
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"] }
            ]
        })

        const response: boolean = foundBlacklist ? true : false
        
        return sendResponse(
            res, 
            200, 
            `Попытка проверки на ЧС. Успешная операция. Пользователь ${userId} проверен на ЧС`,
            { response }
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/blacklist/check')
    }
})

router.get('/blacklist/list', async(req,res) => {
    try {
        const foundBlacklists = await Associations.BLACKLISTS_TAB.findAll({ 
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"] }
            ]
        })

        const foundBlacklistsModel: (Types.Blacklist)[] = foundBlacklists.map(item => item.get({ plain: true }))

        return sendResponse(
            res, 
            200, 
            `Попытка проверки на ЧС. Успешная операция. Выдан список ЧС`,
            foundBlacklistsModel
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/blacklist/list')
    }
})


// ЧС Заявок
router.post('/requestblacklist/add/:userId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const userId = Number(req.params.userId)
        const eventId = Number(req.query.eventId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка занесения в ЧС заявок. MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка занесения в ЧС заявок. Недостаточно прав')

        if(isNaN(userId) && isNaN(eventId)) return sendResponse(res, 400, 'Попытка занесения в ЧС заявок. Входные данные указаны неверно')

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: userId } })
        if(!foundAccount) return sendResponse(res, 404, 'Попытка занесения в ЧС заявок. Пользователь не найден')

        const foundEvent = await EVENTS_TAB.findOne({ where: { id: eventId } })
        if(!foundEvent) return sendResponse(res, 404, 'Попытка занесения в ЧС заявок. Событие не найден')

        const foundConflict = await REQUESTBLACKLISTS_TAB.findOne({ where: { userId, eventId } })
        if(foundConflict) return sendResponse(res, 409, 'Попытка занесения в ЧС заявок. Пользователь уже в ЧС')

        const newBlacklist = await REQUESTBLACKLISTS_TAB.create({ 
            userId,
            executerId: session.account.id,
            eventId
        })
        
        return sendResponse(
            res, 
            200, 
            `Попытка занесения в ЧС заявок. Успешная операция. Пользователь ${userId} добавлен в ЧС заявок ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/requestblacklist/add')
    }
})

router.delete('/requestblacklist/remove/userId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const userId = Number(req.query.userId)
        const eventId = Number(req.query.eventId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка удаления из ЧС заявок (UserId). MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка удаления из ЧС заявок (UserId). Недостаточно прав')

        if(isNaN(userId) && isNaN(eventId)) return sendResponse(res, 400, 'Попытка удаления из ЧС заявок (UserId). Входные данные указаны неверно')

        const foundBlacklist = await REQUESTBLACKLISTS_TAB.findOne({ where: { userId, eventId } })
        if(!foundBlacklist) return sendResponse(res, 404, 'Попытка удаления из ЧС заявок (UserId). Пользователь не найден')

        await foundBlacklist.destroy()
        
        return sendResponse(
            res, 
            200, 
            `Попытка удаления из ЧС заявок (UserId). Успешная операция. Пользователь ${userId} убран из ЧС заявок события ${eventId} ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/requestblacklist/remove/userId')
    }
})

router.delete('/requestblacklist/remove/blId', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms: Types.localEventPermsCheck = res.locals.eventPermsCheck

        const blId = Number(req.query.blId)

        if(!session || !perms) return sendResponse(res, 500, 'Попытка удаления из ЧС заявок (blId). MW sessionCheck/permsCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка удаления из ЧС заявок (blId). Недостаточно прав')

        if(isNaN(blId)) return sendResponse(res, 400, 'Попытка удаления из ЧС заявок (blId). Входные данные указаны неверно')

        const foundBlacklist = await REQUESTBLACKLISTS_TAB.findOne({ where: { id: blId } })
        if(!foundBlacklist) return sendResponse(res, 404, 'Попытка удаления из ЧС заявок (blId). Пользователь не найден')

        const foundBlacklistModel: Types.RequestBlacklist = await foundBlacklist.get({ plain: true }) 

        await foundBlacklist.destroy()
        
        return sendResponse(
            res, 
            200, 
            `Попытка удаления из ЧС заявок (blId). Успешная операция. Пользователь ${foundBlacklistModel.userId} убран из ЧС заявок события ${foundBlacklistModel.eventId} ${perms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором'} ${session.account.id}`
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/requestblacklist/remove/blId')
    }
})

router.get('/requestblacklist/check', async(req,res) => {
    try {
        const userId = Number(req.query.userId)
        const eventId = Number(req.query.eventId)

        if(isNaN(userId)) return sendResponse(res, 400, 'Попытка проверки на ЧС заявок. Входные данные указаны неверно')

        const foundBlacklist = await Associations.REQUESTBLACKLISTS_TAB.findOne({ 
            where: { userId, eventId },
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"] }
            ]
        })

        const response: boolean = foundBlacklist ? true : false
        
        return sendResponse(
            res, 
            200, 
            `Попытка проверки на ЧС заявок. Успешная операция. Пользователь ${userId} в событи ${eventId} проверен на ЧС`,
            { response }
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/requestblacklist/check')
    }
})

router.get('/requestblacklist/list', async(req,res) => {
    try {
        const foundBlacklists = await Associations.REQUESTBLACKLISTS_TAB.findAll({ 
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"] }
            ]
        })

        const foundBlacklistsModel: (Types.RequestBlacklist)[] = foundBlacklists.map(item => item.get({ plain: true }))

        return sendResponse(
            res, 
            200, 
            `Попытка проверки на ЧС заявок. Успешная операция. Выдан список ЧС`,
            foundBlacklistsModel
        )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/measure/requestblacklist/list')
    }
})

export default router