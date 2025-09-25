import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Cookies from 'js-cookie';

import { Event as EventClass } from '../components/class/eventClass.ts'
import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';
import { getUser } from '../module/getUser.ts';

import * as Types from '../../module/types/types.ts'

import './style/eventRegister.css'

type Props = {
    setErrorMessage: (msg: string | null) => void
}

export const EventRegister = ({ setErrorMessage }: Props) => {
    const [isSend, setIsSend] = useState<boolean>(false)

    const [event, setEvent] = useState<EventClass | null>(null)

    const [guild, setGuild] = useState('AV')
    const [shift, setShift] = useState<Types.shift>('1st')

    // Обработка выбранных дней

    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [formattedDays, setFormattedDays] = useState<string[]>([])

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
        prev.includes(day)
            ? prev.filter((d) => d !== day)
            : [...prev, day]
        );
    };



    // Получения события

    useEffect(() => {
        if(event) if(event instanceof EventClass) return

        EventClass.create(setErrorMessage, 'ATP 250')
            .then(gotEvent => {
                if(!gotEvent) return
                if(gotEvent instanceof EventClass) {
                    setEvent(gotEvent)
                } else {
                    errorLogger(setErrorMessage, { status: 500, message: 'Ошибка при поиске события' })
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [])

    useEffect(() => {
        if(!event) return
        setFormattedDays(event.data.days)
    }, [event])


    // Отправка заявки
    const handleConfirm = async() => {
        try {
            const session: string | undefined = Cookies.get("session")

            if(!session) {
                return errorLogger(setErrorMessage, { status: 400, message: 'Требуется авторизация' })
            }

            const parsedSession: Types.Session = JSON.parse(session)

            if(guild === 'AV') {
                const user = await getUser({ setErrorMessage })

                if(!user) return errorLogger(setErrorMessage, { status: 500, message: 'Пользователь не найден' })

                const isAvStaff = await request({ route: '/perms/is/AV_VOLUNTEER', method: 'GET', loadQuery: { userId: user.id } })
            
                if(isAvStaff.container) {
                    const container = isAvStaff.container as { result: boolean }

                    if(!container.result) return errorLogger(setErrorMessage, { status: 403, message: 'Вы не состоите в Alliance of Volunteers' }) 
                } else {
                    return errorLogger(setErrorMessage, { status: 500, message: 'Ошибка при проверке прав' })
                }
            }

            const res = await request({ 
                route: 'event/request/add', 
                method: 'POST', 
                loadQuery: { 
                    eventId: event?.data.id 
                },
                loadData: {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key,
                    guild,
                    days: selectedDays,
                    shift
                } 
            })

            if(res.status === 200) {
                setIsSend(true)
                setTimeout(() => setIsSend(false), 3000)
                return
            }
        } catch (err: any) {
            const errResponse: undefined | Types.Response = err.response.data
            
            const status = errResponse?.status ?? 500
            const message = errResponse?.message ?? 'Непредвиденная ошибка'
            return errorLogger(setErrorMessage, { status: status, message })
        }
    }


    return (
        <div className='event-register-body'>
            <div className='event-register-container'>
                <h2>Запись на ATP250</h2>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className='event-register-h3'>Организация</h3>
                    <select onChange={(e) => setGuild(e.target.value)} className='singup-guild-select'>
                        <option value="AV">Alliance of Volutneers</option>
                        <option value="Jas">Jas</option>
                        <option value="AJ">Ashyq Jurek</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className='event-register-h3'>Смена</h3>
                    <select onChange={(e) => setShift(e.target.value as Types.shift)} className='singup-guild-select'>
                        <option value="1st">1ая (7:30 - 15:00)</option>
                        <option value="2nd">2ая (15:30 - 22:00)</option>
                        <option value="both">Обе смены</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 className='event-register-h3 days'>Выберите желаемые дни участия</h3>
                    <div className='event-register-days-container'>
                        {formattedDays.map((day) => (
                            <label 
                                key={day} 
                                className={`event-register-daylabel ${selectedDays.includes(day) ? 'check' : ''}`}
                            >
                            <input
                                type="checkbox"
                                checked={selectedDays.includes(day)}
                                onChange={() => toggleDay(day)}
                                style={{ display: 'none' }}
                            />
                            { day.split('.')[0] }
                            </label>
                        ))}
                    </div>
                </div>
                <div className='event-register-but-container'>
                    <button className='event-register-but-confirm' onClick={handleConfirm}>Отправить заявку</button>
                    <NavLink to='/event/atp250' className='event-register-but-back'>Вернуться назад</NavLink>
                </div>
                <div style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                    <span className='event-register-sendMessage' style={{ display: isSend ? 'flex' : 'none' }}>Заявка отправлена!</span>
                </div>
            </div>
        </div>
    );
};