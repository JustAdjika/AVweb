import type { Response } from 'express'
import { GetDateInfo } from './formattingDate.ts'
import * as Types from '../module/types/types.ts'

export function sendResponse(
    res: Response,
    status: Types.statusCode = 200,
    message?: string,
    container?: object,
    routerPath?: string
) {
    if(status === 500 && message && routerPath) {
        console.error(`[${GetDateInfo().all}] Непредвиденная ошибка. МАРШРУТ: ${routerPath}. ОШИБКА: ${message}`)
        res.status(status).json({
            status,
            message
        })
    } else if(status !== 200 && message) {
        console.log(`[${GetDateInfo().all}] ${message}`)
        res.status(status).json({
            status,
            message
        })
    } else if(container && message) {
        console.log(`[${GetDateInfo().all}] ${message}`)
        res.status(status).json({
            status,
            container
        })
    } else if(status === 200 && message) {
        console.log(`[${GetDateInfo().all}] ${message}`)
        res.status(status).json({ status })
    } else {
        throw new Error(`[${GetDateInfo().all}] sendResponse error: входные данные ответа указаны неверно`)
    }
}