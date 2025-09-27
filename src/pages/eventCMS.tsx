import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

import { ReactComponent as PersonAlertIcon } from '../assets/icons/person-circle-exclamation-solid-full.svg'
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar-days-solid-full.svg'

import { getUser } from '../module/getUser.ts';
import { Event as EventClass } from '../components/class/eventClass.ts'
import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';
import { downloadApi } from '../module/axiosConfig.ts';

import { Volunteers } from '../components/eventCMS/volunteers.tsx';
import { ExportModal } from '../components/eventCMS/exportModal.tsx';
import { QRModal } from '../components/eventCMS/qrModal.tsx';
import { VolunteersHeader } from '../components/eventCMS/volunteersHeader.tsx';
import { ProfileModal } from '../components/eventCMS/profileModal.tsx';
import { ContextMenu } from '../components/eventCMS/contextMenu.tsx';

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

    const [qrMenu, setQrMenu] = useState<boolean>(false)
    const [exportMenu, setExportMenu] = useState<boolean>(false)
    const [profileMenu, setProfileMenu] = useState<boolean>(false)

    const [calendar, setCalendar] = useState<boolean>(false)

    const [contextMenuVisible, setContextMenuVisible] = useState(false)



    // UX

    const [days, setDays] = useState<string[]>([])

    const [user, setUser] = useState<Types.Account | null>(null)
    const [event, setEvent] = useState<EventClass | null>(null)
    const [userRole,setUserRole] = useState<Types.eventPermission | null>(null)

    const [firstCRDDay, setFirstCRDDay] = useState(0)

    const [exportFor, setExportFor] = useState(0)

    const [qrResult, setQrResult] = useState<string | null>(null)

    const [volunteers, setVolunteers] = useState<(Types.VolunteerData & Types.moreVolsData)[]>([])


    const [_dayLoaded, _setDayLoaded] = useState(false)
    const [_gotDays, _setGotDays] = useState(false)






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
        if(!firstCRDDay) return
        setCurrentDay(firstCRDDay)
        _setDayLoaded(true)
    }, [firstCRDDay])



    // Смена ссылки на день

    const handleChangeLink = (e:any) => {
        event?.setLink(setErrorMessage, days[currentDay], e.target.value)
    }



    // Открытие модального окна
    const handleContextMenu = (volData: Types.VolunteerData & Types.moreVolsData) => {
        setContextMenuData({
            visit: volData.visit,
            late: volData.late,
            isCRD: volData.role === 'CRD' || volData.role === 'HCRD',
            warn: volData.warning,
            bl: volData.blacklist,
            userId: volData.userId as number
        })
        setContextMenuVisible(!contextMenuVisible)
    }




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

    const [contextMenuData, setContextMenuData] = useState<Types.contextMenuData>({
        visit: false,
        late: false,
        isCRD: false,
        warn: false,
        bl: false,
        userId: null
    })



    return (<>
        <ContextMenu 
            menuVisible={contextMenuVisible} 
            contextMenuData={contextMenuData}
            setMenuVisible={setContextMenuVisible}
            setProfileMenu={setProfileMenu}
            setTargetUser={setTargetUser}
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
                    <div 
                        className='cms-headpanel-but-calendar-container' 
                        onClick={() => setCalendar(true)} 
                        style={{ marginRight: userRole === 'CRD' ? '10px' : '0px', display: calendar ? 'none' : 'flex' }}
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
                />
            ) : null }
        </div>
    </>);
};