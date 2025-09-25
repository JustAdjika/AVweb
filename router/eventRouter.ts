// DEPENDENCIES
import express from 'express'
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
import { Event } from '../module/class/eventClass.ts'
import * as arrayCheck from '../module/arrayCheck.ts'
import { GetDateInfo } from '../module/formattingDate.ts'

// DATABASE
import EVENTS_TAB from '../database/events.js'

// MIDDLEWARES
import masterKeyCheck from '../middleware/masterKeyCheck.ts'
import sessionCheck from '../middleware/sessionCheck.ts'
import eventPermsCheck from '../middleware/eventPermsCheck.ts'

const router = express.Router()
const config = new Config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.post('/create', masterKeyCheck, async(req,res) => {
    try {
        interface dataType {
            name: string,
            guilds: string[],
            days: string[]
        }

        const data = req.body
        
        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.name, 'string'],
                    [obj.days, 'object'],
                    [obj.guilds, 'object'], 
                ])) {
                    if(arrayCheck.isStringArray(obj.days) && arrayCheck.isStringArray(obj.guilds)) return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка создания события. Данные указаны неверно')
        
        const newEvent = await Event.create(data.name, data.guilds, data.days)

        return sendResponse(res, 200, `Попытка создания события. Успешная операция. Новое событие создано под id ${newEvent.getModel.id} MASTERKEY`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/create')
    }
})

router.get('/data/:method', async(req,res) => {
    try {
        const method = req.params.method
        const { name, id } = req.query
        const eventId = Number(req.query.id)

        if(!method || ( method !== 'byId' && method !== 'byName' ) ) return sendResponse(res, 400, 'Попытка поиска события. Метод не указан или указан неверно')
        if( (typeof name !== "string" || !name.trim()) && (!id || isNaN(eventId)) ) return sendResponse(res, 400, 'Попытка поиска события. Данные указаны неверно')


        let foundEvent = undefined
        if(method === 'byId') {
            foundEvent = await EVENTS_TAB.findOne({ where: { id } }) 
        } else {
            foundEvent = await EVENTS_TAB.findOne({ where: { name } })
        }

        if(!foundEvent) return sendResponse(res, 404, 'Попытка поиска события. Событие не найдено')

        const foundEventModel: Types.Event = await foundEvent.get({ plain: true }) 

        return sendResponse(res, 200, `Попытка поиска события. Успешная операция. Найдено событие ${foundEventModel.id}`, { event: foundEvent } )
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/data')
    }
})

router.post('/linkadd', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const link = req.body.link
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка смены ссылки. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка смены ссылки. Недостаточно прав')

        if(typeof link !== 'string') return sendResponse(res, 400, 'Попытка смены ссылки. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        event.setLink(eventPermsData.day, link)

        return sendResponse(res, 200, `Попытка смены ссылки. Успешная операция. Ссылка на день ${eventPermsData.day} события ${eventPermsData.eventId} изменена HCRD ${session.account.id} на ${link}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/linkadd')
    }
})

router.put('/info/update', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const infoObject = req.body.info
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка обновления информации события. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка обновления информации события. Недостаточно прав')

        function isValidData(data: unknown): data is Types.eventInfoObject {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.dressCode, 'object'],
                    [obj.behavior, 'object'],
                    [obj.rules, 'object'], 
                ])) {
                    if(arrayCheck.isStringArrayArray(obj.behavior) && arrayCheck.isStringArrayArray(obj.rules)) {
                        if(obj.dressCode !== null) {
                            const obj2 = obj.dressCode as Record<string, unknown>

                            if(dataCheck([
                                [obj2.accept, 'object'],
                                [obj2.deny, 'object'],
                            ])) {
                                if(arrayCheck.isStringArray(obj2.accept) && arrayCheck.isStringArray(obj2.deny)) {
                                    return true
                                }
                            } 
                        }
                    }
                } 
            }
            return false
        }

        if(!isValidData(infoObject)) return sendResponse(res, 400, 'Попытка обновления информации события. Данные указаны неверно')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        event.newInfo = infoObject

        return sendResponse(res, 200, `Попытка обновления информации события. Успешная операция. Информация о событии ${eventPermsData.eventId} изменена HCRD ${session.account.id}`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, 'event/info/update')
    }
})

router.put('/uniqueinfo/update', masterKeyCheck, async(req,res) => {
    try {
        const infoObject = req.body.info
        const eventId = req.body.eventId

        if(typeof infoObject !== 'object' || typeof eventId !== 'number') return sendResponse(res, 400, 'Попытка обновления уникальной информации события. Данные указаны неверно')
        
        const event = await Event.define()
        await event.update(eventId)

        event.newUniqueInfo = infoObject

        return sendResponse(res, 200, `Попытка обновления уникальной информации события. Успешная операция. Изменено MASTERKEY`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/event/uniqueinfo/update')
    }
})

router.patch('/register/change', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        if(!perms || !session) return sendResponse(res, 500, 'Попытка изменения статуса регистрации. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD') return sendResponse(res, 403, 'Попытка изменения статуса регистрации. Недостаточно прав')

        const event = await Event.define()
        await event.update(eventPermsData.eventId)

        await event.changeRegister()

        return sendResponse(res, 200, `Попытка изменения статуса регистрации. Успешная операция. Регистрация успешно ${ event.getModel.isRegisterOpen ? 'открыта' : 'закрыта' } HCRD ${ session.account.id }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, 'event/register/change')
    }
})

router.post('/export/:for', sessionCheck, eventPermsCheck, async(req,res) => {
    try {
        // Входные данные
        const session = res.locals.sessionCheck
        const eventPermsData = req.body.eventPerms as Types.eventPermsData
        const perms = res.locals.eventPermsCheck 

        const _for = req.params.for
        const _type = req.query.type

        const { eventId, day } = eventPermsData


        if(!perms || !session) return sendResponse(res, 500, 'Попытка экспорта таблиц. MW eventPermsCheck/sessionCheck не передал необходимые данные')

        if(perms.perms !== 'HCRD' && perms.perms !== 'CRD') return sendResponse(res, 403, 'Попытка экспорта таблиц. Недостаточно прав')

        if(_for !== 'coordinator' && _for !== 'staff') return sendResponse(res, 400, 'Попытка экспорта таблиц. Данные указаны неверно')
        if(_type !== 'vols' && _type !== 'equip') return sendResponse(res, 400, 'Попытка экспорта таблиц. Данные указаны неверно')


        // Сбор данных
        const event = await Event.define()
        await event.update(eventId)

        const allVolsData = await event.getVolunteersData(day)
        const formattedData = allVolsData.map(vol => ( { 
            iin: vol.account.iin, 
            name: vol.account.name, 
            role: vol.role, 
            measures: vol.blacklist ? 'bl' : vol.warning ? 'warn' : 'none',
            contactWhatsapp: vol.account.contactWhatsapp,
            contactKaspi: vol.account.contactKaspi,
            guild: vol.guild,
            equip: vol.equip,
            visit: vol.visit,
            shift: vol.shift
        } ))

        const allEquipData: ({ provider: string, volunteer: string, status: 'GET' | 'RETURN' })[] = await event.getEquip(day)

        if(_for === 'coordinator' && _type === 'vols') { // Экспорт волонтеров для координаторов

            // Создание таблиц
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet("Volunteers")

            worksheet.columns = [
                { header: 'Num', key: 'id', width: 5},
                { header: 'ИИН', key: 'iin', width: 18},
                { header: 'ФИО', key: 'name', width: 30},
                { header: 'Роль', key: 'role', width: 20},
                { header: 'Пред/ЧС', key: 'measures', width: 10},
                { header: 'Whatsapp', key: 'whatsapp', width: 18},
                { header: 'Организация', key: 'guild', width: 15},
                { header: 'Экипировка', key: 'equip', width: 15},
                { header: 'Посещение', key: 'visit', width: 15},
                { header: 'Смена', key: 'shift', width: 15},
            ]

            formattedData.forEach((vol, i) => {
                const newRow = worksheet.addRow({
                    id: i+1,
                    iin: vol.iin,
                    name: vol.name,
                    role: vol.role === 'VOL' ? 'Волонтёр' : vol.role === 'CRD' ? 'Координатор' : vol.role === 'HCRD' ? 'Гл. Координатор' : '???',
                    measures: vol.measures === 'none' ? 'Нет' : vol.measures === 'warn' ? 'Пред' : vol.measures === 'bl' ? 'ЧС' : '???',
                    whatsapp: vol.contactWhatsapp,
                    guild: vol.guild,
                    equip: vol.equip === 'RETURN' ? 'Сдал' : vol.equip === 'GET' ? 'Не сдал' : '???',
                    visit: vol.visit ? 'Пришел' : 'Не пришел',
                    shift: vol.shift === '1st' ? 'Первая' : vol.shift === '2nd' ? 'Вторая' : 'Обе' 
                })
            })

            worksheet.eachRow(row => {
                row.alignment = { vertical: "middle", horizontal: "left" }
            })

            
            // Экспорт
            const fileName = `${uuidv4()}.xlsx`

            const filePath = __dirname + `/../${config.cachePath}/${fileName}`

            await workbook.xlsx.writeFile(filePath)

            res.status(200).download(filePath, async (err) => {
                if (err) {
                    await unlink(filePath)
                    sendResponse(res, 500, err.message, undefined, '/event/export (res.download)')
                } else {
                    await unlink(filePath)
                    console.log(`[${GetDateInfo().all}] Попытка экспорта таблицы. Успешная операция. Таблица экспортирована для ${ session.account.id } по конфигурации coordinator/vols`)
                }
            });

        } else if(_for === 'staff' && _type === 'vols') { // Экспорт волонтеров для организаторов

            // Создание таблиц
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet("Volunteers")

            worksheet.columns = [
                { header: 'Num', key: 'id', width: 5},
                { header: 'ИИН', key: 'iin', width: 18},
                { header: 'ФИО', key: 'name', width: 30},
                { header: 'Whatsapp', key: 'whatsapp', width: 18},
                { header: 'Kaspi', key: 'kaspi', width: 18},
            ]

            formattedData.forEach((vol, i) => {
                const newRow = worksheet.addRow({
                    id: i+1,
                    iin: vol.iin,
                    name: vol.name,
                    whatsapp: vol.contactWhatsapp,
                    kaspi: vol.contactKaspi,
                })
            })

            worksheet.eachRow(row => {
                row.alignment = { vertical: "middle", horizontal: "left" }
            })

            
            // Экспорт
            const fileName = `${uuidv4()}.xlsx`

            const filePath = __dirname + `/../${config.cachePath}/${fileName}`

            await workbook.xlsx.writeFile(filePath)

            res.status(200).download(filePath, async (err) => {
                if (err) {
                    await unlink(filePath)
                    sendResponse(res, 500, err.message, undefined, '/event/export (res.download)')
                } else {
                    await unlink(filePath)
                    console.log(`[${GetDateInfo().all}] Попытка экспорта таблицы. Успешная операция. Таблица экспортирована для ${ session.account.id } по конфигурации staff/vols`)
                }
            });

        } else { // Экспорт экипа
            
            // Создание таблиц
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet("Equipments")

            worksheet.columns = [
                { header: 'Num', key: 'id', width: 5},
                { header: 'Координатор', key: 'provider', width: 30},
                { header: 'Получатель', key: 'volunteer', width: 30},
                { header: 'Статус', key: 'status', width: 15},
            ]

            allEquipData.forEach((item, i) => {
                const newRow = worksheet.addRow({
                    id: i+1,
                    provider: item.provider,
                    volunteer: item.volunteer,
                    status: item.status === 'GET' ? 'Не сдал' : item.status === 'RETURN' ? 'Сдал' : '???'
                })
            })

            worksheet.eachRow(row => {
                row.alignment = { vertical: "middle", horizontal: "left" }
            })

            
            // Экспорт
            const fileName = `${uuidv4()}.xlsx`

            const filePath = __dirname + `/../${config.cachePath}/${fileName}`

            await workbook.xlsx.writeFile(filePath)

            res.status(200).download(filePath, async (err) => {
                if (err) {
                    await unlink(filePath)
                    sendResponse(res, 500, err.message, undefined, '/event/export (res.download)')
                } else {
                    await unlink(filePath)
                    console.log(`[${GetDateInfo().all}] Попытка экспорта таблицы. Успешная операция. Таблица экспортирована для ${ session.account.id } по конфигурации coordinator/equipments`)
                }
            });

        }
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, 'event/export')
    }
})

export default router