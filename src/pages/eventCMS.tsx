import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';


import { ReactComponent as PersonAlertIcon } from '../assets/icons/person-circle-exclamation-solid-full.svg'
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar-days-solid-full.svg'


import { getUser } from '../module/getUser.ts';
import { Event as EventClass } from '../components/class/eventClass.ts'
import { Position } from '../components/class/positionClass.ts';
import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';
import { downloadApi } from '../module/axiosConfig.ts';


import { ExportModal } from '../components/eventCMS/exportModal.tsx';
import { ProfileModal } from '../components/eventCMS/profileModal.tsx';
import { PositionAddModal } from '../components/eventCMS/positionAddModal.tsx';
import { QRModal } from '../components/eventCMS/qrModal.tsx';
import { PositionLocationUpdateModal } from '../components/eventCMS/positionLocationUpdateModal.tsx';
import { PositionAppointModal } from '../components/eventCMS/positionAppointModal.tsx';

import { Volunteers } from '../components/eventCMS/volunteers.tsx';
import { Positions } from '../components/eventCMS/positions.tsx';
import { Calendar } from '../components/eventCMS/calendar.tsx';
import { ContextMenu } from '../components/eventCMS/contextMenu.tsx';

import { PositionsHeader } from '../components/eventCMS/positionsHeader.tsx';
import { VolunteersHeader } from '../components/eventCMS/volunteersHeader.tsx';


import * as Types from '../../module/types/types.ts'


import './style/eventCMS.css'

type Props = {
    setErrorMessage: (msg: string | null) => void
}

export const EventCMS = ({ setErrorMessage }: Props) => {

    // UI

    // Общие сведения выбранных меню
    const [selectedMenu, setSelectedMenu] = useState( JSON.parse(localStorage.getItem("cmsMenuSetup") ?? 'null').selectedMenu ?? 0 )
    const [shiftMenu, setShiftMenu] = useState( JSON.parse(localStorage.getItem("cmsMenuSetup") ?? 'null').shiftMenu ?? 0 )
    const [currentDay, setCurrentDay] = useState( JSON.parse(localStorage.getItem("cmsMenuSetup") ?? 'null').currentDay ?? 0 )


    // Модальные окна таблицы волонтеров
    const [qrMenu, setQrMenu] = useState<boolean>(false)
    const [exportMenu, setExportMenu] = useState<boolean>(false)
    const [profileMenu, setProfileMenu] = useState<boolean>(false)

    // Модальные окна таблицы позиций
    const [positionAddMenu, setPositionAddMenu] = useState<boolean>(false)
    const [positionLocationMenu, setPositionLocationMenu] = useState<boolean>(false)
    const [positionAppointMenu, setPositionAppointMenu] = useState<boolean>(false)

    // Состояние календаря и контекстного меню
    const [calendar, setCalendar] = useState<boolean>(false)
    const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false)



    // Отслеживание скролла

    useEffect(() => {
        const handleScroll = () => {
            setContextMenuVisible(false)
        }        

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [])



    // Сохранение состояния меню в localStorage
    useEffect(() => {
        const cmsMenuSetup = {
            selectedMenu,
            shiftMenu,
            currentDay
        }

        localStorage.setItem("cmsMenuSetup", JSON.stringify(cmsMenuSetup))
    }, [selectedMenu, shiftMenu, currentDay])



    // UX

    const [days, setDays] = useState<string[]>([])  // Общий массив дней

    // Сведения о пользователе и событии
    const [user, setUser] = useState<Types.Account | null>(null)
    const [event, setEvent] = useState<EventClass | null>(null)
    const [userRole,setUserRole] = useState<Types.eventPermission | null>(null)
    const [firstCRDDay, setFirstCRDDay] = useState(0)   // Первый доступный день для координатора

    const [exportFor, setExportFor] = useState(0) // Выбор варианта экспорта (0-для координаторов, 1-для организаторов)

    const [qrResult, setQrResult] = useState<string | null>(null) // Текст QR кода

    // Списки таблиц
    const [volunteers, setVolunteers] = useState<(Types.VolunteerData & Types.moreVolsData)[]>([])
    const [positions, setPositions] = useState<Position[]>([])

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null) // Выбранная позиция для смены локации

    // Флаги
    const [_dayLoaded, _setDayLoaded] = useState(false)  // Первый доступный день для координатора загружен
    const [_gotDays, _setGotDays] = useState(false)     // Все дни получены 
    const [_dayDenied, _setDayDenied] = useState(false)
    const [_volGot, _setVolGot] = useState(false)






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

    // Получение дней события

    useEffect(() => {
        if(_gotDays || !event) return

        setDays(event.data.days)

        _setGotDays(true)
    }, [event])


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

                    if (eventDays[currentDay] === day) _setDayDenied(true)

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



    // Определение первого доступного дня для координатора

    useEffect(() => {
        if(firstCRDDay === null || !_gotDays) return

        if(_dayDenied) setCurrentDay(firstCRDDay)
        
        _setDayLoaded(true)
    }, [firstCRDDay, _gotDays])



    // Смена ссылки на день

    const handleChangeLink = (e:any) => {
        event?.setLink(setErrorMessage, days[currentDay], e.target.value)
    }



    // Открытие контекстно меню
    function handleContextMenu <T extends Types.contextMenuType = Types.VolunteerData & Types.moreVolsData >(loadData: T, e:any)  {
        if(contextMenuVisible) return setContextMenuVisible(false)

        // const isVolunteerType = (data: any): data is Types.VolunteerData & Types.moreVolsData => 'visit' in data
        const isPosition = (data:any): data is Position => data instanceof Position

        if(isPosition(loadData)) {
            setContextMenuData({
                positionClass: loadData,
                userId: loadData.data.volunteer?.account.id ?? null,
                e: contextMenuVisible ? null : e,
                type: 'position'
            })
        } else {
            setContextMenuData({
                visit: loadData.visit,
                late: loadData.late,
                isCRD: loadData.role === 'CRD' || loadData.role === 'HCRD',
                warn: loadData.warning,
                bl: loadData.blacklist,
                userId: loadData.userId as number,
                e: contextMenuVisible ? null : e,
                type: 'volunteer'
            })
        }
    }


    const [contextMenuData, setContextMenuData] = useState<Types.contextMenuData>({
        visit: false,
        late: false,
        isCRD: false,
        warn: false,
        bl: false,
        userId: null,
        e: null,
        type: 'volunteer'
    })




    // Экспорт волонтеров

    const handleVolExport = async() => {
        const session = Cookies.get("session") as string

        if(!session) errorLogger(setErrorMessage, { status: 500, message: 'Сессия не найдена' })

        const parsedSession: Types.Session = JSON.parse(session)

        try {
            const res = await downloadApi.post(`/event/export/${exportFor === 0 ? 'coordinator' : 'staff'}?type=vols`, {
                eventPerms: {
                    eventId: event?.data.id,
                    day: days[currentDay]
                },
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            })

            const blob = res.data;

            let filename = "export.xlsx";
            const disposition = res.headers["content-disposition"];
            if (disposition && disposition.includes("filename=")) {
                filename = disposition
                    .split("filename=")[1]
                    .replace(/['"]/g, "");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err:any) {
            errorLogger(setErrorMessage, { status: err.response.data.status ?? 500, message: err.response.data.message ?? 'Непредвиденная ошибка'})
        }
    }




    // Скачивание удостоверения
    
    const handleDownloadIdCard = async(id: number) => {
        const session = Cookies.get("session") as string

        if(!session) errorLogger(setErrorMessage, { status: 500, message: 'Сессия не найдена' })

        const parsedSession: Types.Session = JSON.parse(session)

        try {
            const res = await downloadApi.post(`/account/idCard/download/${id}`, {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            })

            const blob = res.data;

            let filename = "idCard.png";
            const disposition = res.headers["content-disposition"];
            if (disposition && disposition.includes("filename=")) {
                filename = disposition
                    .split("filename=")[1]
                    .replace(/['"]/g, "");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err:any) {
            errorLogger(setErrorMessage, { status: err.response.data.status ?? 500, message: err.response.data.message ?? 'Непредвиденная ошибка'})
        }
    }


    // Отображение профиля при сканировании QR кода

    const [targetUser, setTargetUser] = useState<number | null>(null)

    useEffect(() => {
        if(!qrResult) return


        const session = Cookies.get("session")

        if(!session) return

        const parsedSession: Types.Session = JSON.parse(session)

        const getUserData = async() => {
            const res: Types.Response = await axios.post(qrResult, {
                sessionId: parsedSession.id,
                sessionKey: parsedSession.key
            })

            if(res.status === 200) {
                setQrMenu(false)
                setProfileMenu(true)

                const container = res.container as { data: Types.Account }
                setTargetUser(container.data.id as number)
            }
        }

        try {
            getUserData()
        } catch (err: any) {
            const response = err.response.data
            errorLogger(setErrorMessage, { status: response.status ?? 500, message: response.message ?? 'Непредвиденная ошибка' })
        }
    }, [qrResult])



    // Получение волонтеров

    useEffect(() => {
        if(_volGot || !event || !_dayLoaded) return 

        event.getVolunteers(setErrorMessage, days[currentDay])
            .then(res => { 
                if(res?.status === 200) {
                    const container = res.container as (Types.VolunteerData & Types.moreVolsData)[]

                    setVolunteers(container)
                    _setVolGot(true)
                } else {
                    errorLogger(setErrorMessage, res ?? { status: 500, message: 'Непредвиденная ошибка' })
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [event, _dayLoaded, _volGot])


    useEffect(() => {
        _setVolGot(false)
    }, [currentDay])



    // костыль хранящий массив объектов с данными классов позиций
    // Чтобы динамически обрабатывать и ререндерить состояния в таблице, нужно передавать данные на прямую,
    // иначе при изменении данных в классе не вызывается ререндер

    const [positionsData, setPositionsData] = useState<Types.PositionData[]>([])  

    // Обновление костыля для хранения данных

    useEffect(() => {
        setPositionsData(positions.map(pos => pos.actualData))
        console.log(positionsData)
    }, [positions])









    return (<>
        <PositionAppointModal 
            setPositionAppointMenu={setPositionAppointMenu}
            positionAppointMenu={positionAppointMenu}
            volunteers={volunteers}
            setErrorMessage={setErrorMessage}
            currentPosition={selectedPosition}
            setPositionsData={setPositionsData}
        />
        <PositionLocationUpdateModal
            positionLocationMenu={positionLocationMenu}
            setPositionLocationMenu={setPositionLocationMenu}
            currentPosition={selectedPosition as Position}
            setErrorMessage={setErrorMessage}
        />
        <PositionAddModal 
            positionAddMenu={positionAddMenu}
            setPositionAddMenu={setPositionAddMenu}
            positions={positions}
            setPositions={setPositions}
            eventId={event?.data.id as number}
            day={days[currentDay]}
            setErrorMessage={setErrorMessage}
        />
        <ContextMenu 
            menuVisible={contextMenuVisible} 
            contextMenuData={contextMenuData}
            setMenuVisible={setContextMenuVisible}
            setProfileMenu={setProfileMenu}
            setTargetUser={setTargetUser}
            volunteers={volunteers}
            positions={positions}
            setPositions={setPositions}
            setVolunteers={setVolunteers}
            setErrorMessage={setErrorMessage}
            userRole={userRole}
            setSelectedPosition={setSelectedPosition}
            setPositionLocationMenu={setPositionLocationMenu}
            setPositionAppointMenu={setPositionAppointMenu}
            setPositionsData={setPositionsData}
        />
        <ProfileModal 
            profileMenu={profileMenu}
            setProfileMenu={setProfileMenu}
            handleDownloadIdCard={handleDownloadIdCard}
            userId={targetUser}
            event={event as EventClass}
        />
        <ExportModal 
            setExportFor={setExportFor} 
            exportFor={exportFor} 
            exportMenu={exportMenu} 
            setExportMenu={setExportMenu}
            handleVolExport={handleVolExport}
        />
        <QRModal 
            qrMenu={qrMenu} 
            setQrResult={setQrResult} 
            setQrMenu={setQrMenu}
        />
        <div className='cms-body' onClick={() => setContextMenuVisible(false)}>
            <div className='cms-header-container'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>База данных волонтёров</h1>
                    <PersonAlertIcon className='cms-header-alert-icon' />
                </div>
                <span className='cms-header-role' style={{ color: userRole === 'HCRD' ? '#AF1313' : '#2F0774'}}>
                    { userRole === 'HCRD' ? 'Гл. Координатор' : 'Координатор' }
                </span>
            </div>
            { calendar ? <Calendar activeDays={days} currentDay={days[currentDay]} setCurrentDay={setCurrentDay} setCalendar={setCalendar}/> : null }
            <div className='cms-headpanel-container' style={{ display: calendar ? 'none' : 'flex' }}>
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
            <div className='cms-headpanel-functions-but-container' style={{ display: calendar ? 'none' : 'flex' }}>
                <div className='cms-headpanel-center-wrapper'>
                    <div 
                        className='cms-headpanel-but-calendar-container' 
                        onClick={() => setTimeout(() => setCalendar(true), 300)} 
                        style={{ marginRight: userRole === 'CRD' ? '10px' : '0px' }}
                    >
                        <CalendarIcon className='cms-headpanel-but-calendar-icon'/>
                        <span style={{ marginRight: '3px' }}>{currentDay+1} день</span>
                        <span>({days[currentDay]})</span>
                    </div>
                    { !calendar && selectedMenu === 0 ? (
                    <VolunteersHeader 
                        setQrMenu={setQrMenu} 
                        setExportMenu={setExportMenu} 
                        userRole={userRole} 
                        handleChangeLink={handleChangeLink}
                    />
                    ) : selectedMenu === 1 ? (
                        <PositionsHeader
                            setPositionAddMenu={setPositionAddMenu}
                        />
                    ) : null}
                </div>
            </div>
            { calendar ? (
                <div></div>
            ) : selectedMenu === 0 ? (
                <Volunteers 
                    shiftMenu={shiftMenu} 
                    currentDay={currentDay} 
                    event={event} 
                    setErrorMessage={setErrorMessage} 
                    errorLogger={errorLogger} 
                    days={days}
                    _dayLoaded={_dayLoaded}
                    volunteers={volunteers}
                    setVolunteers={setVolunteers}
                    handleContextMenu={handleContextMenu}
                    setMenuVisible={setContextMenuVisible}
                />
            ) : selectedMenu === 1 ? (
                <Positions 
                    handleContextMenu={handleContextMenu}
                    positions={positions}
                    setPositions={setPositions}
                    _dayLoaded={_dayLoaded}
                    currentDay={days[currentDay]}
                    setErrorMessage={setErrorMessage}
                    event={event}
                    setMenuVisible={setContextMenuVisible}
                    positionsData={positionsData}
                />
            ) : null }
        </div>
    </>);
};