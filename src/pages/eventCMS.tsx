import React, { useEffect, useState } from 'react';

import { ReactComponent as PersonAlertIcon } from '../assets/icons/person-circle-exclamation-solid-full.svg'
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar-days-solid-full.svg'
import { ReactComponent as WhatsappIcon } from '../assets/icons/whatsapp-brands-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../assets/icons/qrcode-solid-full.svg'
import { ReactComponent as FileExportIcon } from '../assets/icons/file-arrow-down-solid-full.svg'

import { Volunteers } from '../components/eventCMS/volunteers.tsx';
import { getUser } from '../module/getUser.ts';
import { Event as EventClass } from '../components/class/eventClass.ts'
import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';

import * as Types from '../../module/types/types.ts'


import './style/eventCMS.css'

type Props = {
    setErrorMessage: (msg: string | null) => void
}

export const EventCMS = ({ setErrorMessage }: Props) => {

    // UI

    const [selectedMenu, setSelectedMenu] = useState(0)
    const [shiftMenu, setShiftMenu] = useState(0)
    const [currentDay, setCurrentDay] = useState(0)



    // UX

    const [days, setDays] = useState(['11.10.25', '12.10.25', '13.10.25', '14.10.25'])

    const [user, setUser] = useState<Types.Account | null>(null)
    const [event, setEvent] = useState<EventClass | null>(null)
    const [userRole,setUserRole] = useState<Types.eventPermission | null>(null)

    const [firstCRDDay, setFirstCRDDay] = useState(0)

    const [_dayLoaded, _setDayLoaded] = useState(false)

    // Получение события

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


    // Получение аккаунта

    useEffect(() => {
        if(user) return

        getUser({ setErrorMessage })
            .then(gotUser => {
                if(gotUser?.id) {
                    setUser(gotUser)
                } else {
                    errorLogger(setErrorMessage, { status: 500, message: 'Ошибка при поиске пользователя' })
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [event, user])


    // Проверка прав аккаунта

    useEffect(() => {
        if(!event || !user) return
        if(userRole) return

        const currentEvent = event.data as Types.Event

        request({ method: 'GET', route: `/perms/event/${currentEvent.id}/is/HCRD`, loadQuery: { userId: user.id } })
            .then(res => { 
                if(res.status === 200) {
                    const container = res.container as { result: boolean }

                    if(container.result) setUserRole('HCRD')
                    else checkCRD()
                } else {
                    errorLogger(setErrorMessage, res)
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })

        const checkCRD = async () => {
            const eventDays = event.data.days;

            try {
                const results = await Promise.all(
                eventDays.map(async (day, i) => {
                    const res = await request({
                        method: "GET",
                        route: `perms/event/${event.data.id}/is/CRD`,
                        loadQuery: { userId: user.id, day },
                    });

                    if (res.status === 200) {
                        const container = res.container as { result: boolean };

                        if(container.result) setFirstCRDDay(i)

                        return container.result;
                    }
                    return false;
                })
            );

            if (results.some(Boolean)) {
                setUserRole('CRD');
            }
            } catch (err) {
            console.error(err);
            }
        };

    }, [user])


    useEffect(() => {
        if(!firstCRDDay) return
        setCurrentDay(firstCRDDay)
        _setDayLoaded(true)
    }, [firstCRDDay])



    // Смена ссылки на день

    const handleChangeLink = (e:any) => {
        event?.setLink(setErrorMessage, days[currentDay], e.target.value)
    }



    return (
        <div className='cms-body'>
            <div className='cms-header-container'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>База данных волонтёров</h1>
                    <PersonAlertIcon className='cms-header-alert-icon' />
                </div>
                <span className='cms-header-role' style={{ color: userRole === 'HCRD' ? '#AF1313' : '#2F0774'}}>
                    { userRole === 'HCRD' ? 'Гл. Координатор' : 'Координатор' }
                </span>
            </div>
            <div className='cms-headpanel-container'>
                <div className='cms-headpanel-selector'>
                    <div className='cms-headpanel-selector-wrapper'>
                        <button 
                            onClick={() => setSelectedMenu(0)} 
                            className={`cms-headpanel-selector-but ${selectedMenu === 0 ? 'active' : ''}`}
                        >Волонтеры</button>
                        <button 
                            onClick={() => setSelectedMenu(1)} 
                            className={`cms-headpanel-selector-but ${selectedMenu === 1 ? 'active' : ''}`}
                        >Позиции</button>
                        <button 
                            onClick={() => setSelectedMenu(2)} 
                            className={`cms-headpanel-selector-but ${selectedMenu === 2 ? 'active' : ''}`}
                        >Экипировка</button>
                    </div>
                    <div className={`cms-headpanel-selector-line pos${selectedMenu+1}`}/>
                </div>
                <div className='cms-headpanel-selector shift' style={{ display: selectedMenu === 0 ? 'flex' : 'none' }}>
                    <div className='cms-headpanel-selector-wrapper'>
                        <button 
                            onClick={() => setShiftMenu(0)} 
                            className={`cms-headpanel-selector-but shift ${shiftMenu === 0 ? 'active' : ''}`}
                        >1 смена</button>
                        <button 
                            onClick={() => setShiftMenu(1)} 
                            className={`cms-headpanel-selector-but shift ${shiftMenu === 1 ? 'active' : ''}`}
                        >2 смена</button>
                        <button 
                            onClick={() => setShiftMenu(2)} 
                            className={`cms-headpanel-selector-but shift ${shiftMenu === 2 ? 'active' : ''}`}
                        >Обе смены</button>
                    </div>
                    <div className={`cms-headpanel-selector-line shift pos${shiftMenu+1}`}/>
                </div>
            </div>
            <div className='cms-headpanel-functions-but-container'>
                <div className='cms-headpanel-center-wrapper'>
                    <div className='cms-headpanel-but-calendar-container' style={{ marginRight: userRole === 'CRD' ? '10px' : '0px' }}>
                        <CalendarIcon className='cms-headpanel-but-calendar-icon'/>
                        <span style={{ marginRight: '3px' }}>{currentDay+1} день</span>
                        <span>({days[currentDay]})</span>
                    </div>
                    <div className='cms-headpanel-linkinput-container' style={{ marginRight: '10px', display: userRole === 'HCRD' ? 'flex' : 'none' }}>
                        <WhatsappIcon className='cms-headpanel-linkinput-icon'/>
                        <input 
                            type="text" 
                            className='cms-headpanel-linkinput-input' 
                            placeholder='Ссылка на группу' 
                            onBlur={handleChangeLink} 
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div className='cms-headpanel-qr-but-container'>
                            <QRcodeIcon className='cms-headpanel-function-but-icon'/>
                            <span>QR</span>
                        </div>
                        <div className='cms-headpanel-export-but-container'>
                            <FileExportIcon className='cms-headpanel-function-but-icon'/>
                            <span>Экспорт</span>
                        </div>
                    </div>
                </div>
            </div>
            { selectedMenu === 0 ? (
                <Volunteers 
                    shiftMenu={shiftMenu} 
                    currentDay={currentDay} 
                    event={event} 
                    setErrorMessage={setErrorMessage} 
                    errorLogger={errorLogger} 
                    days={days}
                    _dayLoaded={_dayLoaded}
                />
            ) : null }
        </div>
    );
};