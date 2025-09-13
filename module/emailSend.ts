import * as nodemailer from 'nodemailer'
import { dataCheck } from './dataCheck.ts'
import * as Types from './types/types.ts'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'allianceofvolunteersweb@gmail.com',
        pass: 'eukf fspp fxxn mbqg'
    }
})

interface mailOptionType {
    from: "Alliance of Volunteers Website <allianceofvolunteersweb@gmail.com>"
    to: string,
    subject: string,
    text: string,
    html?: string
}

function isValidData(data: unknown): data is mailOptionType {
    if(typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>

        if(obj.html) {
            if(!dataCheck([[obj.html, 'string']])) return false
        }
        if(dataCheck([
            [obj.to, 'string'], 
            [obj.subject, 'string'], 
            [obj.text, 'string'],
        ]) && obj.from === 'Alliance of Volunteers Website <allianceofvolunteersweb@gmail.com>') {
            return true
        }
    }
    return false
}



export async function sendMail(to: unknown, subject: unknown, text: unknown, html?: unknown): Promise<Types.moduleReturn> {
    try {
        const data: unknown = { from: 'Alliance of Volunteers Website <allianceofvolunteersweb@gmail.com>', to, subject, text, html }
        if(!isValidData(data)) {
            return { status: false, code: 400 }
        }
        
        const info = await transporter.sendMail(data)
        return { status: true, code: 200 }
    } catch (e: any) {
        return { status: false, code: 500, message: e.message }
    }
}