import * as QRCode from 'qrcode'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'


import * as Types from './types/types.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function generateQr(link: string, name: string, type: 'personal' | 'getEquip' | 'returnEquip'): Promise<Types.moduleReturn> {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', 'qr', type, name)

        fs.mkdirSync(path.dirname(filePath), { recursive: true })

        await QRCode.toFile(filePath, link, {
            color: {
                dark: "#1A1A1A",
                light: "#D9D9D9",
            },
            width: 300,
        })

        return { status: true, code: 200 }
    } catch (e) {
        return { status: false, code: 500, message: e.message }
    }
}