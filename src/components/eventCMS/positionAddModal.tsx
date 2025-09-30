import { useState } from 'react';
import Cookies from 'js-cookie';

import { Position } from '../class/positionClass';
import { request } from '../../module/serverRequest';
import { errorLogger } from '../../module/errorLogger';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    setPositionAddMenu: (state: boolean) => any,
    positionAddMenu: boolean,
    positions: Position[],
    setErrorMessage: (msg: string | null) => void,
    eventId: number,
    day: string,
    setPositions: (value: Position[]) => any
}

export const PositionAddModal = ({ setPositionAddMenu, positionAddMenu, positions, setErrorMessage, eventId, day, setPositions }: Props) => {
    const [name, setName] = useState("")
    const [count, setCount] = useState("01")
    const [location, setLocation] = useState("")

    const [conflict, setConflict] = useState(false)

    const handleChangeName = (e: any) => {
        const raw = e.target.value
        const formatted = raw
            .replace(/\d/g, "")
            .replace(/\s+/g, "-")
            .toLowerCase()

        setConflict(positions.some(item => item.data.name === formatted))

        setName(formatted)
    }
    const handleChangeCount = (e: any) => {
        const rawNumber = Number(e.target.value)
        if(isNaN(rawNumber)) return

        setCount(String(rawNumber))
    }

    const handleBlur = () => {
        if(Number(count)<1) return setCount("01")
        const raw = count.replace(/\D/g, "")
        setCount(raw.padStart(2, "0"))
    }

    const handleConfirm = async() => {
        try {
            const session = Cookies.get("session")

            if(!session) return errorLogger(setErrorMessage, { status: 400, message: 'Сессия не найдена' })

            const parsedSession: Types.Session = JSON.parse(session)

            const res = await request({ method: 'POST', route: '/event/position/add', loadData: {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key,
                eventPerms: {
                    eventId,
                    day
                },
                name,
                count: Number(count),
                location
            } })

            if(res.status === 200) {
                const updatedPositions = await Position.create(setErrorMessage, eventId, day)

                if(!updatedPositions) return errorLogger(setErrorMessage, { status: 500, message: 'Непредвиденная ошибка' })
                setPositions(updatedPositions)
            }

            setPositionAddMenu(false)
        } catch (err: any) {
            const response = err?.response?.data
            errorLogger(setErrorMessage, { status: response.status ?? 500, message: response.message ?? 'Непредвиденная ошибка' })
        }
    }

    return (
        <div className="profile-qrmodal-wrapper" style={{ display: positionAddMenu ? 'flex' : 'none' }} onClick={() => setPositionAddMenu(false)}>
            <div className="cms-positionadd-container" onClick={(e) => e.stopPropagation()} style={{ height: conflict ? '280px' : '225px' }}>
                <h2>Добавить позицию</h2>
                <input 
                    type="text" 
                    value={name} 
                    placeholder='Название позиции' 
                    className='cms-positionadd-input' 
                    onChange={(e) => handleChangeName(e)} 
                />
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                    <input 
                        type="text" 
                        value={count} 
                        maxLength={2}
                        placeholder='01' 
                        className='cms-positionadd-input' 
                        style={{ width: '40px', textAlign: 'center', padding: '0px' }}
                        onChange={(e) => handleChangeCount(e)} 
                        onBlur={handleBlur}
                    />
                    <h3>Вместимость позиции</h3>
                </div>
                <input 
                    type="text" 
                    value={location} 
                    placeholder='Локация позиции' 
                    className='cms-positionadd-input' 
                    style={{ marginTop: '10px' }}
                    onChange={(e) => setLocation(e.target.value)} 
                />
                <span className='cms-positionadd-alert' style={{ display: conflict ? 'inline' : 'none' }}>
                    Позиция с названием <span style={{ color: '#066DA7' }}>{name}</span> уже существует. Хотите добавить еще один слот на эту позицию?
                </span>
                <div className='cms-positionadd-but-confirm-wrapper'><button onClick={() => setTimeout(() => handleConfirm(), 300)}>Подтвердить</button></div>
            </div>
        </div>
    );
};