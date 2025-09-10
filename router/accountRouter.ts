// DEPENDENCIES
import express from 'express'
import fileUpload from 'express-fileupload'
import type { UploadedFile } from 'express-fileupload'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { writeFile, unlink } from "fs/promises";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from 'url'
import { createCanvas } from 'canvas'


// MODULES
import * as Types from '../module/types/types.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { GetDateInfo } from '../module/formattingDate.ts'
import { sendResponse } from '../module/response.ts'
import { sendMail } from '../module/emailSend.ts'
import { generateQr } from '../module/generateQr.ts'
import { Config } from '../config.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import EMAILCONFIRMS_TAB from '../database/emailConfirms.js'
import SESSIONS_TAB from '../database/sessions.js'

// MIDDLEWARES
import sessionCheck from '../middleware/sessionCheck.ts'
import permsCheck from '../middleware/permsCheck.ts'
import masterKeyCheck from '../middleware/masterKeyCheck.ts'

const router = express.Router()
const config = new Config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.use(fileUpload())

router.post('/register', async(req, res) => {
    try {
        interface dataType {
            email: string,
            password: string,
            name: string,
            birthday: string,
            region: Types.region,
            iin: string
        }
        
        const data: unknown = req.body 

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.email, 'string'], 
                    [obj.password, 'string'], 
                    [obj.name, 'string'], 
                    [obj.birthday, 'string'],
                    [obj.iin, 'string']
                ]) && (obj.region === 'almaty' || obj.region === 'astana')) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(data)) {
            return sendResponse(res, 400, 'Попытка регистрации. Входные данные указаны неверно')
        }

        const foundSameIIN = await ACCOUNTS_TAB.findAll({
            where: {
                iin: data.iin,
                idCardConfirm: 'CONFIRM'
            }
        })
        const foundSameEmail = await ACCOUNTS_TAB.findAll({
            where: {
                email: data.email
            }
        })

        if(foundSameEmail.length > 0 || foundSameIIN.length > 0) return sendResponse(res, 409, 'Попытка регистрации. Аккаунт с таким зарегистрированным ИИН или почтой уже существуют')


        const token = crypto.randomBytes(32).toString('hex')
        const confirmCode = crypto.randomBytes(3).toString('hex').toUpperCase()

        const now = new Date()

        EMAILCONFIRMS_TAB.create({
            token: token,
            code: confirmCode,
            isRegister: true,
            enteredData: data, 
            expiresAt: new Date(now.getTime() + 15*60*1000)
        })

        const mailStatus = await sendMail(data.email, 'Подтверждение почты', `С вашей почты пытаются зарегистрироваться на сайте Alliance of Volunteers Kazakhstan. Никому не сообщайте следующий код, если же это вы, введите его в поле на сайте. Ваш код подтверждения: ${confirmCode}`)

        if(!mailStatus.status) {
            return sendResponse(res, mailStatus.code, mailStatus.code === 500 ? mailStatus.message : undefined, undefined, 'module emailSend.ts')
        } 

        return sendResponse(res, 200, `Попытка регистрации. Успешная операция. Код подтверждения отправлен на почту ${data.email}`, { confirmToken: token })
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/register')
    }
})



router.post('/emailconfirm/:token', async(req, res) => {
    try {
        interface dataType {
            code: string,
        }
        interface changeDataType {
            code: string,
            sessionKey: string,
            sessionId: number
        }
        
        const token: string = req.params.token
        const data: unknown = req.body


        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.code, 'string'], 
                ])) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(data)) {
            return sendResponse(res, 400, 'Попытка подтверждения почты. Входные данные указаны неверно')
        }



        const foundConfirm = await EMAILCONFIRMS_TAB.findOne({ where: { token } })

        if(!foundConfirm) return sendResponse(res, 422, 'Попытка подтверждения почты. Токен не найден')

        const foundConfirmModel: Types.emailConfirms = foundConfirm.get({ plain: true })

        const now = new Date()

        if(now > foundConfirmModel.expiresAt) return sendResponse(res, 410, 'Попытка подтверждения почты. Срок действия токена истёк')

        if(foundConfirmModel.code !== data.code) return sendResponse(res, 403, 'Попытка подтверждения почты. Код неверный') 

        
        // Если подтверждение почты при регистрации
        if(foundConfirmModel.isRegister) {
            // Валидация указанных json данных 
            let parsedData: object

            interface enteredDataType {
                email: string,
                password: string,
                name: string,
                birthday: string,
                region: Types.region,
                iin: string
            }

            // Функция валидации
            function isValidEnteredData(data: unknown): data is enteredDataType {
                if(typeof data === 'object' && data !== null) {
                    const obj = data as Record<string, unknown>

                    if(dataCheck([
                        [obj.email, 'string'], 
                        [obj.password, 'string'], 
                        [obj.name, 'string'], 
                        [obj.birthday, 'string'],
                        [obj.iin, 'string']
                    ]) && (obj.region === 'almaty' || obj.region === 'astana')) {
                        return true
                    } else {
                        return false
                    }
                } else return false
            }

            // Процесс валидации
            if(typeof foundConfirmModel.enteredData === 'string') {
                if(typeof JSON.parse(foundConfirmModel.enteredData) === 'object') { 
                    parsedData = JSON.parse(foundConfirmModel.enteredData)
                    if(!isValidEnteredData(parsedData)) return sendResponse(res, 400, 'Попытка подтверждения почты при регистрации. Данные указаны неверно') 
                } else {
                    return sendResponse(res, 400, 'Попытка подтверждения почты при регистрации. У данных неверный тип') 
                }
            } else if(typeof foundConfirmModel.enteredData === 'object') {
                parsedData = foundConfirmModel.enteredData
                if(!isValidEnteredData(parsedData)) return sendResponse(res, 400, 'Попытка подтверждения почты при регистрации. Данные указаны неверно') 
            } else {
                return sendResponse(res, 400, 'Попытка подтверждения почты при регистрации. У данных неверный тип') 
            }

            const foundSameEmail = await ACCOUNTS_TAB.findOne({ where: { email: parsedData.email }})

            if(foundSameEmail) return sendResponse(res, 409, 'Попытка подтверждения почты при регистрации. Аккаунт уже создан') 

            // Генерация ключа и названия qr кода
            const key = crypto.randomBytes(64).toString('hex')
            const personalQrName: string = `${uuidv4()}.png`

            
            // Объект аккаунта
            const newAccount: Types.Account = {
                name: parsedData.name,
                birthday: parsedData.birthday,
                iin: parsedData.iin,
                region: parsedData.region,
                email: parsedData.email,
                password: await bcrypt.hash(parsedData.password, 10),
                contactKaspi: null,
                contactWhatspapp: null,
                idCardId: null,
                personalQrId: personalQrName,
                registerAt: new Date(),
                idCardConfirm: "UNCERTAIN",
                supervisorId: null
            } 

            const accountObject = await ACCOUNTS_TAB.create(newAccount as any) as any

            // Объект сессии
            const newSession: Types.Session = {
                key: await bcrypt.hash(key, 10),
                userId: accountObject.id
            }

            // Генерация qr и проверка успеха
            const generateStatus = await generateQr(`${config.urlHost}/api/developer/account/qr/person/${accountObject.id}`, personalQrName, 'personal')

            if(generateStatus.status) {
                const newSessionModel = await SESSIONS_TAB.create(newSession as any) as any
                return sendResponse(res, 200, `Попытка регистрации. Успешная операция. Регистрация пользователя ${accountObject.id}`, { userData: accountObject, sessionData: { key: key, id: newSessionModel.id } } ) 
            } else {
                await accountObject.destroy()
                return sendResponse(res, generateStatus.code, `Попытка регистрации. Регистрация прервана, ошибка генерации QR кода: ${generateStatus.message}`, undefined, 'module generateQr.ts') 
            }
        } else { // При смене почты
            function isValidChangeData(data: unknown): data is changeDataType {
                if(typeof data === 'object' && data !== null) {
                    const obj = data as Record<string, unknown>

                    if(dataCheck([
                        [obj.code, 'string'], 
                        [obj.sessionKey, 'string'],
                        [obj.sessionId, 'number'],
                    ])) {
                        return true
                    } else {
                        return false
                    }
                } else return false
            }

            if(!isValidChangeData(data)) return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Входные данные указаны неверно')

            const foundSession = await SESSIONS_TAB.findOne({ where: { id: data.sessionId } })
            if(!foundSession) return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Сессия не найдена')

            const foundSessionModel: Types.Session = foundSession.get({ plain: true })

            if(!await bcrypt.compare(data.sessionKey, foundSessionModel.key)) return sendResponse(res, 403, 'Попытка подтверждения почты при смене. Ключ сессии неверный')

            const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: foundSessionModel.userId }})
            if(!foundAccount) return sendResponse(res, 404, 'Попытка подтверждения почты при смене. Сессия не связана с пользователем')


            // Валидация указанных json данных 
            let parsedData: object

            interface enteredDataType {
                email: string,
            }

            // Функция валидации
            function isValidEnteredData(data: unknown): data is enteredDataType {
                if(typeof data === 'object' && data !== null) {
                    const obj = data as Record<string, unknown>

                    if(dataCheck([
                        [obj.email, 'string'],
                    ])) {
                        return true
                    } else {
                        return false
                    }
                } else return false
            }

            // Процесс валидации
            if(typeof foundConfirmModel.enteredData === 'string') {
                if(typeof JSON.parse(foundConfirmModel.enteredData) === 'object') { 
                    parsedData = JSON.parse(foundConfirmModel.enteredData)
                    if(!isValidEnteredData(parsedData)) return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Данные указаны неверно') 
                } else {
                    return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Данные указаны неверно') 
                }
            } else if(typeof foundConfirmModel.enteredData === 'object') {
                parsedData = foundConfirmModel.enteredData
                if(!isValidEnteredData(parsedData)) return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Данные указаны неверно') 
            } else {
                return sendResponse(res, 400, 'Попытка подтверждения почты при смене. Данные указаны неверно') 
            }

            const updatedUser = await foundAccount.update({ email: parsedData.email })

            return sendResponse(res, 200, `Попытка подтверждения почты при смене. Успешная операция на ${parsedData.email}`, { updateData: updatedUser })
        }
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/emailconfirm')
    }
})

router.post('/emailChange', sessionCheck, async(req, res) => {
    try {
        interface dataType {
            userId: number,
            newEmail: string
        }

        const data = req.body
        const userSession = res.locals.sessionCheck?.account as Types.Account

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.userId, 'number'], 
                    [obj.newEmail, 'string'],
                ])) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка смены почты. Данные указаны неверно')
            
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: data.userId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка смены почты. ID целевого пользователя не найден') 

        if(userSession.id !== data.userId) return sendResponse(res, 403, 'Попытка смены почты. Пользователь сессии и целевой пользователь не совпадают')



        const token = crypto.randomBytes(32).toString('hex')
        const confirmCode = crypto.randomBytes(3).toString('hex').toUpperCase()

        const now = new Date()

        const loadData = {
            email: data.newEmail
        }

        EMAILCONFIRMS_TAB.create({
            token: token,
            code: confirmCode,
            isRegister: false,
            enteredData: loadData, 
            expiresAt: new Date(now.getTime() + 15*60*1000)
        })

        const mailStatus = await sendMail(data.newEmail, 'Подтверждение почты', `Вашу почту пытаются привязать к аккаунту Alliance of Volunteers Kazakhstan. Никому не сообщайте следующий код, если же это вы, введите его в поле на сайте. Ваш код подтверждения: ${confirmCode}`)

        if(!mailStatus.status) {
            return sendResponse(res, mailStatus.code, mailStatus.code === 500 ? mailStatus.message : undefined, undefined, 'module emailSend.ts')
        } 

        return sendResponse(res, 200, `Попытка смены почты. Успешная операция. Код подтверждения отправлен на почту ${data.newEmail}`, { confirmToken: token })
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/emailChange')
    }
})

router.post('/login', async(req, res) => {
    try {
        interface dataType {
            email: string,
            password: string
        }

        const data = req.body

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.email, 'string'], 
                    [obj.password, 'string']
                ])) {
                    return true
                } else {
                    return false
                }
            } else return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка входа. Данные указаны неверно')

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { email: data.email } })
        if(!foundAccount) return sendResponse(res, 404, 'Попытка входа. Почта не найдена')

        const foundAccountModel: Types.Account = foundAccount.get({ plain: true })
        if(!await bcrypt.compare(data.password, foundAccountModel.password)) return sendResponse(res, 403, 'Попытка входа. Пароль неверный')
    
        const key = crypto.randomBytes(64).toString('hex')

        const newSession: Types.Session = {
            key: await bcrypt.hash(key, 10),
            userId: foundAccountModel.id as number
        }

        const newSessionModel = await SESSIONS_TAB.create(newSession as any) as any
        return sendResponse(res, 200, `Попытка входа. Успешная операция. Вход в ${foundAccountModel.id}`, { userData: foundAccountModel, sessionData: { key: key, id: newSessionModel.id } } ) 

    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/login')
    }
})

router.post('/data/search', sessionCheck, permsCheck, async(req, res) => {
    try {
        const id = Number(req.query.id)

        if(!id || isNaN(id)) return sendResponse(res, 400, 'Попытка получения акканта. Данные указаны неверно')

        const hunterSession = res.locals.sessionCheck?.account as Types.Account
        const hunterPerms = res.locals.permsCheck?.perms as 'USER' | 'ADMIN' | 'COORDINATOR'

        if(hunterPerms === 'USER') return sendResponse(res, 403, 'Попытка получения аккаунта. Недостаточно прав')

        const foundData = await ACCOUNTS_TAB.findOne({ where: { id } })
        if(!foundData) return sendResponse(res, 404, 'Попытка получения аккаунта. Пользователь не найден')
        
        const foundDataModel: Types.Account = foundData.get({ plain: true })
        return sendResponse(
            res, 
            200, 
            `Попытка получения аккаунта. Успешная операция. Выдан пользователь ${foundDataModel.id} ${ hunterPerms === 'ADMIN' ? 'Администратору' : 'Координатору' } ${hunterSession.id}`, 
            { data: foundDataModel } 
        )
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/data/search')
    }
})

router.post('/qr/scan/personal/:id', sessionCheck, permsCheck, async(req, res) => {
    try {
        const id = Number(req.params.id)

        if(!id || isNaN(id)) return sendResponse(res, 400, 'Попытка сканирования лич QR. Данные указаны неверно')

        const hunterSession = res.locals.sessionCheck?.account as Types.Account
        const hunterPerms = res.locals.permsCheck?.perms as 'USER' | 'ADMIN' | 'COORDINATOR'

        if(hunterPerms === 'USER') return sendResponse(res, 403, 'Попытка сканирования лич QR. Недостаточно прав')

        const foundData = await ACCOUNTS_TAB.findOne({ where: { id } })
        if(!foundData) return sendResponse(res, 404, 'Попытка сканирования лич QR. Пользователь не найден')
        
        const foundDataModel: Types.Account = foundData.get({ plain: true })

        const { password, ...publicData } = foundDataModel // publicData без пароля

        return sendResponse(
            res, 
            200, 
            `Попытка сканирования лич QR. Успешная операция. Сканирован пользователь ${foundDataModel.id} ${ hunterPerms === 'ADMIN' ? 'Администратором' : 'Координатором' } ${hunterSession.id}`, 
            { data: publicData } 
        )
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/data/qr/scan/personal')
    }
})

router.delete('/:id', masterKeyCheck, async(req, res) => {
    try {
        const id = Number(req.params.id)

        if(!id || isNaN(id)) return sendResponse(res, 400, 'Попытка удаления аккаунта. Данные указаны неверно')

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id } })
        if(!foundAccount) return sendResponse(res, 404, 'Попытка удаления аккаунта. Пользователь не найден')

        const foundAccountModel: Types.Account = foundAccount.get({ plain: true })
        
        const backupData = foundAccount.get({ plain: true })
        const backupName = `accountBackup_${backupData.id}.json`
        
        const backupPath = __dirname + `/..${config.backupPath}/` + backupName

        await writeFile(backupPath, JSON.stringify(backupData, null, 2))

        await foundAccount.destroy()

        await SESSIONS_TAB.destroy({ where: { userId: foundAccountModel.id } })

        return sendResponse(res, 200, `Попытка удаления аккаунта. Успешная операция. Удален пользователь ${backupData.id} при использовании МАСТЕР КЛЮЧА. Резервная копия сохранена`)
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account (delete)')
    }
})

router.patch('/idCard/setStatus/:status/:id', sessionCheck, permsCheck, async(req, res) => {
    try {
        const id = Number(req.params.id)
        const status = req.params.status.toUpperCase() ?? undefined
        

        const preceptorAccount = res.locals.sessionCheck as Types.localSessionCheck
        const preceptorPerms = res.locals.permsCheck as Types.localPermsCheck

        if(!preceptorPerms || !preceptorAccount) return sendResponse(res, 500, 'Попытка изменения статуса удостоверения. MW не вернул необходимые данные')

        if(!id || isNaN(id)) return sendResponse(res, 400, 'Попытка изменения статуса удостоверения. Данные указаны неверно')
        if(!status || status !== 'CONFIRM' && status !== 'UNCERTAIN') return sendResponse(res, 400, 'Попытка изменения статуса удостоверения. Данные указаны неверно')

        if(preceptorPerms.perms === 'USER') return sendResponse(res, 403, 'Попытка изменения статуса удостоверения. Недостаточно прав')
        
        
        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id } })
        if(!foundAccount) return sendResponse(res, 404, 'Попытка изменения статуса удостоверения. Пользователь не найден')

        const foundAccountModel: Types.Account = foundAccount.get({ plain: true })

        await foundAccount.update({ idCardConfirm: status, supervisorId: status === 'CONFIRM' ? preceptorAccount.account.id : null }) 

        return sendResponse(
            res, 
            200, 
            `Попытка изменения статуса удостоверения. Успешная операция. Удостоверение ${ foundAccountModel.id } ${ status === 'CONFIRM' ? 'ПОДТВЕРЖДЕНО' : 'ОТКЛОНЕНО' } ${ preceptorPerms.perms === 'COORDINATOR' ? 'Координатором' : 'Администратором' } ${ preceptorAccount.account.id }`
        )
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/idCard/setStatus')
    }
})

router.post('/idCard/upload', sessionCheck, async(req, res) => {
    try {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']

        const sessionAccount = res.locals.sessionCheck as Types.localSessionCheck
        if(!req.files || !req.files.idcard) return sendResponse(res, 400, 'Попытка загрузки удостоверения. Файл не загружен')

        if(!sessionAccount) return sendResponse(res, 500, 'Попытка загрузки удостоверения. MW не вернул необходимые данные')

        let files: UploadedFile[] = []

        if(Array.isArray(req.files.idcard)) files = req.files.idcard
        else files = [req.files.idcard]

        if(files.length > 1) return sendResponse(res, 400, 'Попытка загрузки удостоверения. Загружено больше 1 файла')

        for(const file of files) {
            if(!allowedTypes.includes(file.mimetype)) {
                return sendResponse(res, 400, 'Попытка загрузки удостоверения. Неверный формат файла')
            }
        }
        
        const tempPath = __dirname + `/..${config.cachePath}/`

        const idCard = files[0]
        const ext = path.extname(idCard.name)
        const generatedId = uuidv4()
        const fileName = `tempIdCard_${generatedId}.png`

        const idCardPath = __dirname + `/../uploads/idCard/`

        if (!existsSync(tempPath)) mkdirSync(tempPath, { recursive: true });
        if (!existsSync(idCardPath)) mkdirSync(idCardPath, { recursive: true });

        await idCard.mv(path.join(idCardPath, fileName))

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: sessionAccount.account.id } })
        if(!foundAccount) return sendResponse(res, 500, 'Попытка загрузки удостоверения. Сессия не привязана к аккаунту')

        foundAccount.update({ idCardId: fileName })

        return sendResponse(res, 200, `Попытка загрузки удостоверения. Успешная операция. Удостоверение ${ sessionAccount.account.id } загружено и ждет подтверждения`)
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/account/idCard/upload')
    }
})

export default router