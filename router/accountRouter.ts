// DEPENDENCIES
import express from 'express'
import fileUpload from 'express-fileupload'
import type { UploadedFile } from 'express-fileupload'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { writeFile } from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from 'url'


// MODULES
import * as Types from '../module/types/types.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { GetDateInfo } from '../module/formattingDate.ts'
import { sendResponse } from '../module/response.ts'
import { sendMail } from '../module/emailSend.ts'
import { generateQr } from '../module/generateQr.ts'
import { Config } from '../config.ts'
import { Equipment } from '../module/class/equipClass.ts'

// DATABASE
import ACCOUNTS_TAB from '../database/accounts.js'
import EMAILCONFIRMS_TAB from '../database/emailConfirms.js'
import SESSIONS_TAB from '../database/sessions.js'
import PASSWORDRECOVERS_TAB from '../database/passwordRecovers.js'
import EQUIPMENTS_TAB from '../database/equipments.js'

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
    } catch (e:any) {
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
            const generateStatus = await generateQr(`${config.serverDomain}/api/developer/account/qr/person/${accountObject.id}`, personalQrName, 'personal')

            if(generateStatus.status) {
                const newSessionModel = await SESSIONS_TAB.create(newSession as any) as any
                await foundConfirm.destroy()
                return sendResponse(res, 200, `Попытка регистрации. Успешная операция. Регистрация пользователя ${accountObject.id}`, { userData: accountObject, sessionData: { key: key, id: newSessionModel.id } } ) 
            } else {
                await accountObject.destroy()
                await foundConfirm.destroy()
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

            await foundConfirm.destroy()

            return sendResponse(res, 200, `Попытка подтверждения почты при смене. Успешная операция на ${parsedData.email}`, { updateData: updatedUser })
        }
    } catch (e:any) {
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
    } catch (e:any) {
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

    } catch (e:any) {
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
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/data/search')
    }
})

router.post('/qr/person/:id', sessionCheck, permsCheck, async(req, res) => {
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
    } catch (e:any) {
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
    } catch (e:any) {
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
    } catch (e:any) {
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
        const fileName = `idCard_${generatedId}.png`

        const idCardPath = __dirname + `/../uploads/idCard/`

        if (!existsSync(tempPath)) mkdirSync(tempPath, { recursive: true });
        if (!existsSync(idCardPath)) mkdirSync(idCardPath, { recursive: true });

        await idCard.mv(path.join(idCardPath, fileName))

        const foundAccount = await ACCOUNTS_TAB.findOne({ where: { id: sessionAccount.account.id } })
        if(!foundAccount) return sendResponse(res, 500, 'Попытка загрузки удостоверения. Сессия не привязана к аккаунту')

        foundAccount.update({ idCardId: fileName })

        return sendResponse(res, 200, `Попытка загрузки удостоверения. Успешная операция. Удостоверение ${ sessionAccount.account.id } загружено и ждет подтверждения`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/idCard/upload')
    }
})

router.post('/idCard/download/:id', sessionCheck, permsCheck, async(req, res) => {
    try {
        const sessionAccount = res.locals.sessionCheck as Types.localSessionCheck
        const perms = res.locals.permsCheck as Types.localPermsCheck
        const userCardId = Number(req.params.id)

        if(!sessionAccount) return sendResponse(res, 500, 'Попытка скачивания удостоверения. MW не вернул необходимые данные')
        if(!userCardId || isNaN(userCardId)) return sendResponse(res, 400, 'Попытка скачивания удостоверения. Данные указаны неверно')

        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: userCardId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка скачивания удостоверения. Целевой пользователь не найден')

        const foundTargetUserModel: Types.Account = foundTargetUser.get({ plain: true })
        const filePath = __dirname + `/../uploads/idCard/${foundTargetUserModel.idCardId}`

        res.status(200).download(filePath, async (err) => {
            if (err) {
                sendResponse(res, 500, err.message, undefined, '/account/idCard/download (res.download)')
            } else {
                console.log(`[${GetDateInfo().all}] Попытка скачивания удостоверения. Успешная операция. Удостоверение ${ userCardId } скачано ${ perms.perms === 'ADMIN' ? 'Администратором' : 'Координатором' } ${ sessionAccount.account.id }`)
            }
        });
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/idCard/download')
    }
})

router.put('/info/personal/edit', masterKeyCheck, async(req, res) => {
    try {
        interface dataType {
            userId: number,
            personalInfo: Types.personalData
        }

        const data = req.body

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.userId, 'number'], 
                    [obj.personalInfo, 'object']
                ])) {
                    const innerObj = obj.personalInfo as Record<string, unknown>
                    
                    if(dataCheck([
                        [innerObj.name, 'string'],
                        [innerObj.birthday, 'string'],
                        [innerObj.iin, 'string']
                    ]) && (innerObj.region === 'almaty' || innerObj.region === 'astana') ) {
                        return true
                    }
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка изменения лич инфо. Данные указаны неверно')
        
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: data.userId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка изменения лич инфо. Целевой пользователь не найден')

        await foundTargetUser.update({ 
            name: data.personalInfo.name,
            birthday: data.personalInfo.birthday,
            iin: data.personalInfo.iin,
            region: data.personalInfo.region
        })

        return sendResponse(res, 200, `Попытка изменения лич инфо. Успешная операция. ЛИ Пользователя ${ data.userId } изменена MASTERKEY`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/info/personal/edit')
    }
})

router.put('/info/contact/edit', sessionCheck, async(req, res) => {
    try {
        interface dataType {
            userId: number,
            contactInfo: Types.contactData
        }

        const data = req.body
        const session: Types.localSessionCheck | undefined = res.locals.sessionCheck

        if(!session) return sendResponse(res, 500, 'Попытка изменения контакт инфо. MW не вернул необходимые данные')

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.userId, 'number'], 
                    [obj.contactInfo, 'object']
                ])) {
                    const innerObj = obj.contactInfo as Record<string, unknown>
                    
                    if((typeof innerObj.contactKaspi === 'string' || innerObj.contactKaspi === null) && (typeof innerObj.contactWhatsapp === 'string' || innerObj.contactWhatsapp === null) ) {
                        return true
                    }
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка изменения контакт инфо. Данные указаны неверно')

        if(session.account.id !== data.userId) return sendResponse(res, 403, 'Попытка изменения контакт инфо. Сессия не связана с целевым пользователем')
        
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: data.userId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка изменения контакт инфо. Целевой пользователь не найден')

        await foundTargetUser.update({ 
            contactKaspi: data.contactInfo.contactKaspi,
            contactWhatsapp: data.contactInfo.contactWhatsapp
        })

        return sendResponse(res, 200, `Попытка изменения контакт инфо. Успешная операция. Пользователь ${ data.userId } сменил свою КИ`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/info/contact/edit')
    }
})

router.patch('/password/change', sessionCheck, async(req, res) => {
    try {
        interface dataType {
            userId: number,
            oldPassword: string,
            newPassword: string
        }

        const data = req.body
        const session: Types.localSessionCheck | undefined = res.locals.sessionCheck

        if(!session) return sendResponse(res, 500, 'Попытка изменения пароля. MW не вернул необходимые данные')

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.userId, 'number'], 
                    [obj.oldPassword, 'string'],
                    [obj.newPassword, 'string'],
                ])) {
                    return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка изменения пароля. Данные указаны неверно')

        if(session.account.id !== data.userId) return sendResponse(res, 403, 'Попытка изменения пароля. Сессия не связана с целевым пользователем')
        
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: data.userId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка изменения пароля. Целевой пользователь не найден')

        const foundTargetUserModel: Types.Account = foundTargetUser.get({ plain: true })
        if( !await bcrypt.compare( data.oldPassword, foundTargetUserModel.password ) ) return sendResponse(res, 403, 'Попытка изменения пароля. Пароль неверный')

        const newHashPass = await bcrypt.hash(data.newPassword, 10)

        await foundTargetUser.update({ password: newHashPass })

        return sendResponse(res, 200, `Попытка изменения пароля. Успешная операция. Пользователь ${ data.userId } сменил свой пароль`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/password/change')
    }
})

router.post('/password/recovery/sendlink', async(req, res) => {
    try {
        interface dataType {
            email: string,
        }

        const data = req.body

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.email, 'string'], 
                ])) {
                    return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка восстановления пароля (1 stage). Данные указаны неверно')
        
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { email: data.email } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка восстановления пароля (1 stage). Целевой пользователь не найден')

        const foundTargetUserModel: Types.Account = foundTargetUser.get({ plain: true })
        const newToken = crypto.randomBytes(32).toString('hex')
        const now = new Date()

        const newRecovery = await PASSWORDRECOVERS_TAB.create({
            token: newToken,
            userId: foundTargetUserModel.id,
            expiresAt: new Date(now.getTime() + 15*60*1000),
        })

        sendMail(
            data.email, 
            `Восстановление пароля`, 
            `Пароль вашего аккаунта на сайте Alliance of Volunteers пытаются сменить. Если это вы, перейдите по ссылке и введите новый пароль. Ссылка: ${config.clientDomain}/passwordRecovery?token=${newToken}`
        )

        return sendResponse(res, 200, `Попытка восстановления пароля (1 stage). Успешная операция. Сообщение с ссылкой отправлено на почту ${ data.email }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/password/recovery/sendlink')
    }
})

router.post('/password/recovery/end', async(req, res) => {
    try {
        interface dataType {
            newPassword: string
        }

        const data = req.body
        const token = req.query.token

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.newPassword, 'string'], 
                ])) {
                    return true
                } 
            }
            return false
        }

        if(!isValidData(data)) return sendResponse(res, 400, 'Попытка восстановления пароля (2 stage). Данные указаны неверно')

        const foundRecovery = await PASSWORDRECOVERS_TAB.findOne({ where: { token } })
        if(!foundRecovery) return sendResponse(res, 404, 'Попытка восстановления пароля (2 stage). Токен не найден')
        
        const foundRecoveryModel: Types.PasswordRecovery = foundRecovery.get({ plain: true })
        
        const foundTargetUser = await ACCOUNTS_TAB.findOne({ where: { id: foundRecoveryModel.userId } })
        if(!foundTargetUser) return sendResponse(res, 404, 'Попытка восстановления пароля (2 stage). Целевой пользователь не найден')

        const foundTargetUserModel: Types.Account = foundTargetUser.get({ plain: true })
        const newPassword = await bcrypt.hash(data.newPassword, 10)

        const now = new Date()
        if(now > foundRecoveryModel.expiresAt) return sendResponse(res, 498, 'Попытка восстановления пароля (2 stage). Токен просрочен')

        await foundTargetUser.update({ password: newPassword })

        await foundRecovery.destroy()

        return sendResponse(res, 200, `Попытка восстановления пароля (2 stage). Успешная операция. Пароль пользователя ${ foundTargetUserModel.id } изменен`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/password/recovery/end')
    }
})

router.post('/logout', sessionCheck, async(req, res) => {
    try {
        const session: Types.localSessionCheck | undefined = res.locals.sessionCheck

        if(!session) return sendResponse(res, 500, 'Попытка выхода. MW не вернул необходимые данные')

        const foundSession = await SESSIONS_TAB.findOne({ where: { id: session.session.id } })
        if(!foundSession) return sendResponse(res, 500, 'Попытка выхода. Сессии не существует')

        await foundSession.destroy()

        return sendResponse(res, 200, `Попытка выхода. Успешная операция. Удаление сессии ${ session.session.id } связанный с аккаунтом ${ session.account.id }`)
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/logout')
    }
})

router.post('/equipment/qrgenerate/get', sessionCheck, async(req, res) => {
    try {
        const session: Types.localSessionCheck = res.locals.sessionCheck

        if(!session) return sendResponse(res, 500, 'Попытка генерации QR получения экипа. MW не вернул необходимые данные')
        
        const newToken = crypto.randomBytes(32).toString('hex')

        const newEquip = await Equipment.create(session.account.id as number, newToken)

        const qrId = newEquip.getModel.qrId

        return sendResponse(res, 200, `Попытка генерации QR получения экипа. Успешная операция. Сгенерирован новый QR код для выдачи экипа пользователю ${ session.account.id }`, { qrId })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/equipment/qrgenerate/get')
    }
})

router.post('/equipment/qrgenerate/return', sessionCheck, async(req, res) => {
    try {
        const session: Types.localSessionCheck | undefined = res.locals.sessionCheck

        if(!session) return sendResponse(res, 500, 'Попытка генерации QR сдачи экипа. MW не вернул необходимые данные')

        const qrId = uuidv4()
        const qr: Types.moduleReturn = await generateQr(`${config.serverDomain}/api/developer/event/equipment/qr/return/scan?userId=${ session.account.id }`, `returnEquip_${qrId}.png`, 'returnEquip')
        
        if(!qr.status) return sendResponse(res, qr.code, qr.message)

        return sendResponse(res, 200, `Попытка генерации QR сдачи экипа. Успешная операция. Сгенерирован новый QR код для сдачи экипа пользователя ${ session.account.id }`, { qrId: `returnEquip_${qrId}.png` })
    } catch (e:any) {
        return sendResponse(res, 500, e.message, undefined, '/account/equipment/qrgenerate/return')
    }
})

export default router