// DEPENDENCIES
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

// MODULES
import * as Types from '../types/types.ts'
import { generateQr } from '../generateQr.ts'
import { Config } from '../../config.ts'

// DATABASE
import EQUIPMENTS_TAB from '../../database/equipments.js'
import ACCOUNTS_TAB from '../../database/accounts.js'


// MIDDLEWARES



const config = new Config()

export class Equipment {
    // Data
    private id: number | null = null
    private token: string | null = null
    private qrId: string | null = null
    private userId: number | null = null
    private providerId: number | null = null
    private eventId: number | null = null
    private day: string | null = null
    private expiresAt: Date | null = null
    private status: Types.equipmentStatus | null = null







    // Constructor
    private constructor(
        id: number | null = null,
        token: string | null = null,
        qrId: string | null = null,
        userId: number | null = null,
        providerId: number | null = null,
        eventId: number | null = null,
        day: string | null = null,
        expiresAt: Date | null = null,
        status: Types.equipmentStatus | null = null
    ) {
        this.id = id,
        this.token = token,
        this.qrId = qrId,
        this.userId = userId,
        this.providerId = providerId,
        this.eventId = eventId,
        this.day = day,
        this.expiresAt = expiresAt,
        this.status = status
    }

    static async define() {
        return new Equipment(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        )
    }

    static async create(userId: number, token: string) {
        const hashToken = await bcrypt.hash(token, 10)
        const qrId = uuidv4()
        const now = new Date()

        const lastUserEquip = await EQUIPMENTS_TAB.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        }) 

        if(lastUserEquip) {
            const lastUserEquipModel: Types.Equipment = lastUserEquip.get({ plain: true })

            if(lastUserEquipModel.expiresAt > now) {
                return new Equipment(
                    lastUserEquipModel.id,
                    lastUserEquipModel.token,
                    lastUserEquipModel.qrId,
                    lastUserEquipModel.userId,
                    lastUserEquipModel.providerId,
                    lastUserEquipModel.eventId,
                    lastUserEquipModel.day,
                    lastUserEquipModel.expiresAt,
                    lastUserEquipModel.status
                )
            }
        }

        const foundUser = await ACCOUNTS_TAB.findOne({ where: { id: userId } })
        if(!foundUser) throw new Error(`Module equipClass.ts error: Impossible to use create(), account undefined`)

        const newEquip = await EQUIPMENTS_TAB.create({
            token: hashToken,
            userId: userId,
            providerId: null,
            eventId: null,
            day: null,
            expiresAt: new Date(now.getTime() + 15*60*1000),
            status: 'REQUEST',
            qrId: `getEquip_${qrId}.png`,
        })

        const newEquipModel: Types.Equipment = await newEquip.get({ plain: true })

        
        const qr: Types.moduleReturn = await generateQr(`${config.serverDomain}/api/developer/event/equipment/qr/get/scan?token=${token}&equipId=${newEquipModel.id}`, `getEquip_${qrId}.png`, 'getEquip')

        if(!qr.status) { 
            await newEquip.destroy()
            throw new Error(`Module equipClass.ts error: Impossible to use create(), QR generate error ${qr.message}`)
        }

        return new Equipment(
            newEquipModel.id,
            newEquipModel.token,
            newEquipModel.qrId,
            newEquipModel.userId,
            newEquipModel.providerId,
            newEquipModel.eventId,
            newEquipModel.day,
            newEquipModel.expiresAt,
            newEquipModel.status
        )
        }






    // Set data

    async update(id: number | undefined) {
        if(!this.id && !id) throw new Error('Module equipClass.ts error: Impossible to use update() before define it or select id')

        const currentEquip = await EQUIPMENTS_TAB.findOne({ where: id ? { id } : { id: this.id } })
        if(!currentEquip) throw new Error('Module equipClass.ts error: update() undefined currentEquip by id')
        const currentEquipModel: Types.Equipment = await currentEquip.get({ plain: true })
        
        this.id = currentEquipModel.id as number,
        this.token = currentEquipModel.token,
        this.qrId = currentEquipModel.qrId,
        this.userId = currentEquipModel.userId,
        this.providerId = currentEquipModel.providerId,
        this.eventId = currentEquipModel.eventId,
        this.day = currentEquipModel.day,
        this.expiresAt = currentEquipModel.expiresAt,
        this.status = currentEquipModel.status
    }

    async getEquip(token: string, providerId: number, eventId: number, day: string) {
        if(!this.id) throw new Error('Module equipClass.ts error: Impossible to use getEquip() before define it or select id')

        if(!await bcrypt.compare(token, this.token as string)) throw new Error('Module equipClass.ts error: Impossible to use getEquip() token compare denied')

        const foundEquip = await EQUIPMENTS_TAB.findOne({ where: { id: this.id } })
        if(!foundEquip) throw new Error('Module equipClass.ts error: Impossible to use getEquip() equipment undefined')
        
        const now = new Date()
        const foundEquipModel: Types.Equipment = await foundEquip.get({ plain: true })
        if(foundEquipModel.expiresAt < now) throw new Error('Module equipClass.ts error: Impossible to use getEquip() equipment token expired')
            
        this.status = 'GET'
        foundEquip.update({ status: 'GET', providerId, eventId, day })
    }

    async returnEquip(userId: number, arg: { force: boolean } = { force: false }) {
        if(!this.id) throw new Error('Module equipClass.ts error: Impossible to use returnEquip() before define it or select id')

        const foundEquip = await EQUIPMENTS_TAB.findOne({ where: { id: this.id } })
        if(!foundEquip) throw new Error('Module equipClass.ts error: Impossible to use returnEquip() equipment undefined')
        const foundEquipModel: Types.Equipment = await foundEquip.get({ plain: true })

        if(foundEquipModel.userId === userId || arg.force) {
            this.status = 'RETURN'
            foundEquip.update({ status: 'RETURN' })
        } else throw new Error('Module equipClass.ts error: Impossible to use returnEquip() compare id denied')
    }

    async getLastEquip(userId: number) {
        const lastUserEquip = await EQUIPMENTS_TAB.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        }) 

        if(!lastUserEquip) throw new Error('Module equipClass.ts error: Impossible to use getLastEquip() equipment undefined')

        const lastUserEquipModel: Types.Equipment = await lastUserEquip.get({ plain: true })

        this.id = lastUserEquipModel.id as number,
        this.token = lastUserEquipModel.token,
        this.qrId = lastUserEquipModel.qrId,
        this.userId = lastUserEquipModel.userId,
        this.providerId = lastUserEquipModel.providerId,
        this.eventId = lastUserEquipModel.eventId,
        this.day = lastUserEquipModel.day,
        this.expiresAt = lastUserEquipModel.expiresAt,
        this.status = lastUserEquipModel.status
    }






    // Get data
     
    get getModel() {
        return {
            id: this.id,
            token: this.token,
            qrId: this.qrId,
            userId: this.userId,
            providerId: this.providerId,
            eventId: this.eventId,
            day: this.day,
            expiresAt: this.expiresAt,
            status: this.status
        }
    }

    async getInstance() {
        if(!this.id) throw new Error('Module equipClass.ts error: Impossible to use getInstance() before define it')

        const currentEquip = await EQUIPMENTS_TAB.findOne({ where: { id: this.id } })
        if(!currentEquip) throw new Error('Module equipClass.ts error: getInstance() undefined instance of object by id')
        return currentEquip
    }

}