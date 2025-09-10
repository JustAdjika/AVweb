import express from 'express'
import { Op } from 'sequelize'

import * as Types from '../module/types/types.ts'
import { Config } from '../config.ts'
import { sendResponse } from '../module/response.ts'
import { dataCheck } from '../module/dataCheck.ts'
import { sendMail } from '../module/emailSend.ts'

import ACCOUNTS_TAB from '../database/accounts.js'

const router = express.Router()
const config = new Config()

router.post('/email/org', async(req,res) => {
    try {
        interface dataType {
            email: string,
            contact: string,
            text: string
        }

        const data = req.body

        function isValidData(data: unknown): data is dataType {
            if(typeof data === 'object' && data !== null) {
                const obj = data as Record<string, unknown>

                if(dataCheck([
                    [obj.email, 'string'], 
                    [obj.contact, 'string'], 
                    [obj.text, 'string']
                ])){
                    return true
                }
            }
            return false
        }

        if(!isValidData(data)) {
            return sendResponse(res, 400, 'Попытка отправки формы организатора. Входные данные указаны неверно')
        }

        const result: Types.moduleReturn = await sendMail(config.staffEmail, `Заявление организатора (Обратная связь ${data.contact})`, data.text)
        if(!result.status) return sendResponse(res, result.code, result.message)

        return sendResponse(res, 200, 'Попытка отправки формы организатора. Успешная операция. Заявление организатора отправлено на почту')
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/forms/email.org')
    }
})

router.get('/profile/search', async(req,res) => {
    try {
        const data = req.query.info
        
        const foundAccounts = await ACCOUNTS_TAB.findAll({
            where: {
                [Op.or]: [
                    { iin: data },
                    { id: data },
                    { name: { [Op.like]: `%${data}%` } },
                    { contactKaspi: data },
                    { contactWhatsapp: data },
                    { email: data },
                ],
            }
        })

        return sendResponse(res, 200, 'Попытка поиска аккаунтов. Успешная операция. Список выдан', foundAccounts)
    } catch (e) {
        return sendResponse(res, 500, e.message, undefined, '/profile/search')
    }
})

export default router