// DEPENDENCIES
import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

// MODULES
import * as Types from '../module/types.ts'
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

const router = express.Router()
const config = new Config()

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

        const mailStatus = await sendMail(data.email, 'Подтверждение почты', `С вашей почты пытаются зарегистрироваться на сайте Alliance of Volunteers Kazakhstan. Никому не сообщайте код следующий код, если же это вы, введите его в поле на сайте. Ваш код подтверждения: ${confirmCode}`)

        if(!mailStatus.status) {
            return sendResponse(res, mailStatus.code, mailStatus.code === 500 ? mailStatus.message : undefined, undefined, 'module emailSend.ts')
        } 

        return sendResponse(res, 200, `Попытка регистрации. Код подтверждения успешно отправлен на почту ${data.email}`, { recoveryToken: token })
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
                return sendResponse(res, 200, `Попытка регистрации. Успешная регистрация пользователя ${accountObject.id}`, { userData: accountObject, sessionData: newSession } ) 
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
                        [obj.sessionId, 'string'],
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

            if(foundSessionModel.key !== data.sessionKey) return sendResponse(res, 403, 'Попытка подтверждения почты при смене. Ключ сессии неверный')

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



export default router