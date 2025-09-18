// DEPENDENCIES
import express from 'express'
import { Op } from 'sequelize'

// MODULES
import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { sendMail } from '../module/emailSend.ts'
import { Event } from '../module/class/eventClass.ts'

import * as Associations from '../database/associations.js'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import sessionCheck from '../middleware/sessionCheck.ts'
import permsCheck from '../middleware/permsCheck.ts'
import PERMS_TAB from '../database/perms.js'
import MASTERKEYS_TAB from '../database/masterKeys.js'
import AVSTAFFS_TAB from '../database/avstaffs.js'

const router = express.Router()
const config = new Config()

router.post('/add', sessionCheck, permsCheck, async(req,res) => {
    try {
        interface dataType {
            iin: string,
            masterKey?: string,
            role: 'USER' | 'AV_VOLUNTEER' | 'COORDINATOR' | 'ADMIN'
        }

        const perms: Types.localPermsCheck = res.locals.permsCheck
        const session: Types.localSessionCheck = res.locals.sessionCheck

        const unknownData = req.body


        // Валидация 
        if(!unknownData.iin || typeof unknownData.iin !== 'string') return sendResponse(res, 400, 'Попытка выдачи роли. Данные указаны неверно')
        if(unknownData.role !== 'USER' && unknownData.role !== 'AV_VOLUNTEER' && unknownData.role !== 'COORDINATOR' && unknownData.role !== 'ADMIN') return sendResponse(res, 400, 'Попытка выдачи роли. Роли не существует')

        const data = unknownData as dataType


        // Поиск по подтвержденному ИИН
        const foundUsers = await ACCOUNTS_TAB.findAll({ where: { iin: data.iin, idCardConfirm: 'CONFIRM' } })
        const foundUsersModel: (Types.Account)[] = foundUsers.map(item => item.get({ plain: true }))

        if(foundUsersModel.length === 0) return sendResponse(res, 404, 'Попытка выдачи роли. Такого ИИН нет в базе, либо он не подтвержден координатором')
        if(foundUsersModel.length > 1) return sendResponse(res, 500, 'Попытка выдачи роли. В базе несколько таких подтвержденных ИИН. Рекомендация немедленно разобраться с ситуацией и связаться с техническим администратором, для решения данной проблемы')
        
        const foundUser = foundUsersModel[0]


        // Определение прав выдачи и процесс выдачи

        const targetUserPerms = await PERMS_TAB.findOne({ where: { userId: foundUser.id } })

        if(data.role === 'ADMIN' || data.role === 'COORDINATOR' || targetUserPerms) {

            if(!data.masterKey) return sendResponse(res, 403, 'Попытка выдачи роли. Для данного действия нужен MASTER KEY')

            const now = new Date()
            const foundKey = await MASTERKEYS_TAB.findOne({ where: { key: data.masterKey } })
            if(!foundKey) return sendResponse(res, 403, 'Попытка выдачи роли. Мастер ключ не найден') 

            const foundKeyModel: Types.MasterKey = foundKey.get({ plain: true })
            if(foundKeyModel.expiresAt < now) return sendResponse(res, 498, 'Попытка выдачи роли. Мастер ключ просрочен')


            if(data.role === 'ADMIN' || data.role === 'COORDINATOR') {
                const foundPerms = await PERMS_TAB.findOne({ where: { userId: foundUser.id } })

                if(foundPerms) {
                    await foundPerms.update({ permission: data.role })
                } else {
                    const newPerms = await PERMS_TAB.create({
                        userId: foundUser.id,
                        permission: data.role,
                        preceptorId: 'MASTERKEY'
                    })
                }

                if(data.role === 'COORDINATOR') {
                    const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUser.id } })

                    if(!foundAvVolunteer) {
                        const newAvStaff = await AVSTAFFS_TAB.create({
                            userId: foundUser.id,
                            role: 'COORDINATOR',
                            preceptorId: 'MASTERKEY'
                        })
                    } else {
                        foundAvVolunteer.update({ role: 'COORDINATOR', preceptorId: 'MASTERKEY' })
                    }
                }
            } else if(data.role === 'AV_VOLUNTEER') {
                const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUser.id } })

                if(foundAvVolunteer) {
                    await targetUserPerms!.destroy()

                    foundAvVolunteer.update({ role: 'VOLUNTEER', preceptorId: 'MASTERKEY' })
                } else {
                    await targetUserPerms!.destroy()

                    const newAvStaff = await AVSTAFFS_TAB.create({
                        userId: foundUser.id,
                        role: 'VOLUNTEER',
                        preceptorId: 'MASTERKEY'
                    })
                }
            } else {
                const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUser.id } })
                
                if(foundAvVolunteer) {

                    await targetUserPerms!.destroy()
                    await foundAvVolunteer.destroy()

                } else await targetUserPerms!.destroy()
            }
            
        } else {

            if(data.role === 'AV_VOLUNTEER') {
                const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUser.id } })

                if(foundAvVolunteer) return sendResponse(res, 200, 'Попытка выдачи роли. Пользователь уже волонтер AV')
                
                await AVSTAFFS_TAB.create({
                    userId: foundUser.id,
                    role: 'VOLUNTEER',
                    preceptorId: session.account.id
                })
            } else {
                const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUser.id } })

                if(!foundAvVolunteer) return sendResponse(res, 200, 'Попытка выдачи роли. Пользователь не является волонтером AV')
                
                await foundAvVolunteer.destroy()
            }

        }

        const result: Types.moduleReturn = await sendMail(foundUser.email, 'Выдача роли', `Вам выдана роль ${data.role} на сайте Alliance of Volunteers составом координаторов. Ознакомьтесь с вашими новыми правами`)
        
        if(!result.status) return sendResponse(res, result.code, result.message)

        return sendResponse(res, 200, `Попытка выдачи роли. Успешная операция. Роль ${data.role} выдана пользователю ${foundUser.id} модератором ${session.account.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/perms/add')
    }
})

router.get('/is/:role', async(req,res) => {
    try {
        const role = req.params.role
        const userId = Number(req.query.userId)


        // Валидация 
        if(!userId || isNaN(userId) || !role) return sendResponse(res, 400, 'Попытка проверки на роль. Данные указаны неверно')
        if(role !== 'USER' && role !== 'AV_VOLUNTEER' && role !== 'COORDINATOR' && role !== 'ADMIN') return sendResponse(res, 400, 'Попытка проверки на роль. Роли не существует')


        // Поиск пользователя
        const foundUser = await ACCOUNTS_TAB.findOne({ where: { id: userId } })

        if(!foundUser) return sendResponse(res, 404, 'Попытка проверки на роль. Пользователь не найден')

        const foundUserModel: Types.Account = await foundUser.get({ plain: true })


        // Определение прав 

        const foundAvVolunteer = await AVSTAFFS_TAB.findOne({ where: { userId: foundUserModel.id } })
        const foundPerms = await PERMS_TAB.findOne({ where: { userId: foundUserModel.id } })

        const foundPermsModel: Types.Perms | null = await foundPerms?.get({ plain: true })

        const isRole = () => {
            switch(role) {
                case 'USER':
                    return !foundAvVolunteer && !foundPerms;
                case 'AV_VOLUNTEER':
                    return !!foundAvVolunteer && !foundPerms;
                case 'COORDINATOR':
                    return foundPermsModel?.permission === 'COORDINATOR';
                case 'ADMIN':
                    return foundPermsModel?.permission === 'ADMIN';
                default:
                    return false;
            }
        };


        return sendResponse(res, 200, `Попытка проверки на роль. Успешная операция. ${userId} проверен на ${role}`, { result: isRole() })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/perms/is')
    }
})

router.get('/event/:eventId/is/:role', async(req,res) => {
    try {
        const role = req.params.role
        const eventId = Number(req.params.eventId)
        const userId = Number(req.query.userId)
        const day = req.query.day


        // Валидация 
        if(!userId || isNaN(userId) || !role || (!day && (role === 'CRD' || role === 'VOL')) || !eventId || isNaN(eventId)) return sendResponse(res, 400, 'Попытка проверки на роль события. Данные указаны неверно')
        if(role !== 'CRD' && role !== 'HCRD' && role !== 'VOL') return sendResponse(res, 400, 'Попытка проверки на роль события. Роли не существует')


        // Поиск события и пользователя
        
        const event = await Event.define()
        await event.update(eventId)


        await event.isHCRD(userId)
       
        const isRole = async() => {
            switch(role) {
                case 'HCRD': 
                    return await event.isHCRD(userId) 
                case 'CRD': 
                    return await event.isCRDbyDay(userId, day as string)
                case 'VOL': 
                    return await event.isVolunteer(userId, day as string)
            }
        }

        return sendResponse(res, 200, `Попытка проверки на роль события. Успешная операция. ${userId} проверен на ${role}`, { result: await isRole() })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/perms/event/is')
    }
})

router.get('/avstaff', async(req,res) => {
    try {
        const foundAvStaffs = await Associations.AVSTAFFS_TAB.findAll({ 
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name"]}
            ]
        })

        return sendResponse(res, 200, `Попытка получения всех AV волонтеров. Успешная операция. `, foundAvStaffs)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/perms/avstaff')
    }
})

router.post('/avstaff/data', sessionCheck, permsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck as Types.localSessionCheck
        const perms = res.locals.permsCheck as Types.localPermsCheck 

        if(!session || !perms) return sendResponse(res, 400, `Попытка получения информации о всех AV волонтеров. MW sessionCheck/permsCheck не вернул необходимые данные`)

        if(perms.perms !== 'COORDINATOR' && perms.perms !== 'ADMIN') return sendResponse(res, 403, `Попытка получения информации о всех AV волонтеров. Недостаточно прав`)

        const foundAvStaffs = await Associations.AVSTAFFS_TAB.findAll({ 
            include: [
                { model: Associations.ACCOUNTS_TAB, attributes: ["id", "name", "birthday", "iin", "region", "email", "contactKaspi", "contactWhatsapp", "idCardId", "registerAt", "idCardConfirm", "supervisorId"]}
            ]
        })

        return sendResponse(res, 200, `Попытка получения данных всех AV волонтеров. Успешная операция. Список выдан для ${perms.perms === 'ADMIN' ? 'Администратора' : 'Координатора'} ${session.account.id}`, foundAvStaffs)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/perms/avstaff/data')
    }
})

export default router