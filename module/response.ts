import type { Response } from 'express'
import { GetDateInfo } from './formattingDate.ts'

export function sendResponse(
    res: Response,
    status: 200 | 400 | 401 | 403 | 404 | 409 | 410 | 422 | 498 | 500 = 200,
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