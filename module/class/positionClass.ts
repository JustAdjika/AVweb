// DEPENDENCIES
import { Op } from 'sequelize'

// MODULES
import * as Types from '../types/types.ts'

// DATABASE
import VOLUNTEERS_TAB from '../../database/volunteers.js'
import EVENTPERMS_TAB from '../../database/eventPerms.js'
import BLACKLISTS_TAB from '../../database/blacklists.js'
import EQUIPMENTS_TAB from '../../database/equipments.js'
import POSITIONS_TAB from '../../database/positions.js'

import * as Associations from '../../database/associations.js'

// MIDDLEWARES



const publicIdGenerator = (eventId: number, day: string, posId: number) => {
    const dayId = day.replace(/\./g, "").slice(0, 4)
    return `POS#${eventId}-${dayId}-${posId}`
}

export class Position {
    // Data
    private id: number | null = null
    private publicId: string | null = null
    private name: string | null = null
    private NameNumber: number | null = null
    private location: string | null = null
    private volunteerId: number | null = null
    private eventId: number | null = null
    private day: string | null = null
    private mapLocId: string | null = null

    private _deleted: boolean = false







    // Constructor
    private constructor(
        id: number | null = null,
        publicId: string | null = null,
        name: string | null = null,
        NameNumber: number | null = null,
        location: string | null = null,
        volunteerId: number | null = null,
        eventId: number | null = null,
        day: string | null = null,
        mapLocId: string | null = null
    ) {
        this.id = id,
        this.publicId = publicId,
        this.name = name,
        this.NameNumber = NameNumber,
        this.location = location,
        this.volunteerId = volunteerId,
        this.eventId = eventId,
        this.day = day,
        this.mapLocId = mapLocId
    }

    static async define() {
        return new Position(
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

    static async create(name: string, count: number, eventId: number, day: string, location: string) {
        const foundConflict = await POSITIONS_TAB.findAll({ where: { day, eventId, name } })
        if(foundConflict.length > 0) {
            const foundConflictModel: (Types.Position)[] = foundConflict.map(item => item.get({ plain: true }))

            const newPos = await POSITIONS_TAB.create({
                name,
                publicId: '',
                NameNumber: foundConflictModel.length+1,
                location,
                volunteerId: null,
                eventId,
                day,
                mapLocId: null
            })

            await newPos.update({ publicId: publicIdGenerator(eventId, day, await newPos.get({ plain: true }).id) })
        } else {
            if(count<1) throw new Error('Module positionClass.ts error: Impossible to use create(), need more than 0 count')

            for(let i: number = 0; i<count; i++) {
                const newPos = await POSITIONS_TAB.create({
                    name,
                    publicId: '',
                    NameNumber: i+1,
                    location,
                    volunteerId: null,
                    eventId,
                    day,
                    mapLocId: null
                })

                await newPos.update({ publicId: publicIdGenerator(eventId, day, await newPos.get({ plain: true }).id) })
            }
        }

        let newPositionModel

        if(foundConflict.length === 0 && count > 1) {
            const allCurrentPositions = await POSITIONS_TAB.findAll({ where: { name, eventId, day } })
            const allCurrentPositionsModel: (Types.Position)[] = allCurrentPositions.map(item => item.get({ plain: true })) 

            newPositionModel = allCurrentPositionsModel as (Types.Position)[]
        } else {
            const currentPosition = await POSITIONS_TAB.findOne({ where: { name, eventId, day } })
            if(!currentPosition) throw new Error('Module positionClass.ts error: create() error, currentPosition not found')
            newPositionModel = await currentPosition.get({ plain: true }) as Types.Position
        }

        if(Array.isArray(newPositionModel)) {
            const classes = newPositionModel.map(item => {
                return new Position(
                    item.id,
                    item.publicId,
                    item.name,
                    item.NameNumber,
                    item.location,
                    item.volunteerId,
                    item.eventId,
                    item.day,
                    item.mapLocId
                )
            })

            return classes
        } else {
            return new Position(
                newPositionModel.id,
                newPositionModel.publicId,
                newPositionModel.name,
                newPositionModel.NameNumber,
                newPositionModel.location,
                newPositionModel.volunteerId,
                newPositionModel.eventId,
                newPositionModel.day,
                newPositionModel.mapLocId
            )
        }
    }






    // Set data

    async update(id: number | undefined) {
        if(this.id && !id) this.isDeleted()

        if(!this.id && !id) throw new Error('Module positionClass.ts error: Impossible to use update() before define it or select id')

        const currentPosition = await POSITIONS_TAB.findOne({ where: id ? { id } : { id: this.id } })
        if(!currentPosition) throw new Error('Module positionClass.ts error: update() undefined currentPosition by id')
        const currentPositionModel: Types.Position = await currentPosition.get({ plain: true })
        
        this.id = currentPositionModel.id as number
        this.publicId = currentPositionModel.publicId
        this.name = currentPositionModel.name
        this.NameNumber = currentPositionModel.NameNumber
        this.location = currentPositionModel.location
        this.volunteerId = currentPositionModel.volunteerId
        this.eventId = currentPositionModel.eventId
        this.day = currentPositionModel.day
        this.mapLocId = currentPositionModel.mapLocId
        this._deleted = false
    }

    async changeLocation(newLoc: string) {
        this.isDeleted()

        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use changeLocation() before define it')
        const foundPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })

        if(!foundPosition) throw new Error('Module positionClass.ts error: Impossible to use changeLocation(), position undefined')

        this.location = newLoc
        await foundPosition.update({ location: newLoc })
    }

    async setVolunteer(volId: number) {
        this.isDeleted()

        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer() before define it')
        const foundPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })

        if(!foundPosition) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer(), position undefined')
            
        const foundVol = await VOLUNTEERS_TAB.findOne({ where: { id: volId } })
        if(!foundVol) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer(), volunteer undefined')

        const foundVolModel: Types.Volunteer = await foundVol.get({ plain: true })
        if(foundVolModel.day !== this.day) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer(), volunteer day incorrect')

        this.volunteerId = volId
        await foundPosition.update({ volunteerId: volId })
    }

    async setMarker(marker: Types.mapMarker) {
        this.isDeleted()

        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use setMarker() before define it')
        const foundPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })

        if(!foundPosition) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer(), position undefined')

        this.mapLocId = marker
        await foundPosition.update({ mapLocId: marker })
    }

    async removeVolunteer() {
        this.isDeleted()

        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use removeVolunteer() before define it')
        const foundPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })

        if(!foundPosition) throw new Error('Module positionClass.ts error: Impossible to use setVolunteer(), position undefined')

        this.volunteerId = null
        await foundPosition.update({ volunteerId: null })
    }

    async destroy() {
        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use destroy() before define it')

        const currentPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })
        if(!currentPosition) throw new Error('Module positionClass.ts error: destroy() undefined instance of object by id')

        this._deleted = true
        await currentPosition.destroy()
    }







    // Get data
     
    get getModel() {
        this.isDeleted()
        return {
            id: this.id,
            publicId: this.publicId,
            name: this.name,
            NameNumber: this.NameNumber,
            location: this.location,
            volunteerId: this.volunteerId,
            eventId: this.eventId,
            day: this.day,
            mapLocId: this.mapLocId,
        }
    }

    async getInstance() {
        this.isDeleted()
        if(!this.id) throw new Error('Module positionClass.ts error: Impossible to use getInstance() before define it')

        const currentPosition = await POSITIONS_TAB.findOne({ where: { id: this.id } })
        if(!currentPosition) throw new Error('Module positionClass.ts error: getInstance() undefined instance of object by id')
        return currentPosition
    }

    async isDeleted() {
        if(this._deleted) {
            throw new Error('Module positionClass.ts error: Object has been destroyed')
        }
    }

}