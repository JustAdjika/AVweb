import React, { useEffect, useState } from 'react';

import { ReactComponent as PersonAlertIcon } from '../assets/icons/person-circle-exclamation-solid-full.svg'
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar-days-solid-full.svg'
import { ReactComponent as WhatsappIcon } from '../assets/icons/whatsapp-brands-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../assets/icons/qrcode-solid-full.svg'
import { ReactComponent as FileExportIcon } from '../assets/icons/file-arrow-down-solid-full.svg'

import * as Types from '../../module/types/types.ts'


import './style/eventCMS.css'

type Props = {
    setErrorMesssage: (msg: string | null) => void
}

export const EventCMS = ({ setErrorMesssage }: Props) => {

    // UI

    const [selectedMenu, setSelectedMenu] = useState(0)
    const [shiftMenu, setShiftMenu] = useState(0)
    const [currentDay, setCurrentDay] = useState(0)

    const [focusVolunteer,setFocusVolunteer] = useState<number | null>(null)



    // UX

    interface moreVolsData {
        role: "HCRD" | "CRD" | "VOL";
        equip: "GET" | "RETURN" | null;
        blacklist: boolean;
    }

    const [volunteers, setVolunteers] = useState<(Types.VolunteerData & moreVolsData)[]>([])

    const [days, setDays] = useState(['11.10.25', '12.10.25', '13.10.25'])

    useEffect(() => {
        setVolunteers([
            {
                id: 1,
                userId: 101,
                guild: "Jas",
                visit: true,
                late: false,
                eventId: 4,
                day: "11.10.25",
                warning: false,
                inStaffRoom: true,
                shift: "1st",
                account: {
                    id: 201,
                    name: "Aidos Serik",
                    birthday: "15.04.01",
                    region: "almaty",
                    iin: "010415123456",
                    email: "aidos.serik@example.com",
                    contactKaspi: "+7 (777) 123 4567",
                    contactWhatsapp: "+7 (777) 123 4567"
                },
                role: "VOL",
                equip: "GET",
                blacklist: false
            },
            {
                id: 2,
                userId: 102,
                guild: "AV",
                visit: false,
                late: true,
                eventId: 4,
                day: "12.10.25",
                warning: true,
                inStaffRoom: false,
                shift: "1st",
                account: {
                    id: 202,
                    name: "Dana Karim",
                    birthday: "09.11.02",
                    region: "astana",
                    iin: "021109654321",
                    email: "dana.karim@example.com",
                    contactKaspi: "+7 (701) 234 5678",
                    contactWhatsapp: "+7 (701) 234 5678"
                },
                role: "VOL",
                equip: null,
                blacklist: false
            },
            {
                id: 3,
                userId: 103,
                guild: "AJ",
                visit: true,
                late: true,
                eventId: 4,
                day: "13.10.25",
                warning: false,
                inStaffRoom: true,
                shift: "1st",
                account: {
                    id: 203,
                    name: "Miras Akhmet",
                    birthday: "28.07.00",
                    region: "almaty",
                    iin: "000728987654",
                    email: "miras.akhmet@example.com",
                    contactKaspi: "+7 (705) 345 6789",
                    contactWhatsapp: "+7 (705) 345 6789"
                },
                role: "VOL",
                equip: "RETURN",
                blacklist: true
            }
        ])
    }, [])

    const [selectedShift,setSelectedShift] = useState('1st')

    useEffect(() => {
        switch(shiftMenu) {
            case 0: setSelectedShift('1st');break;
            case 1: setSelectedShift('2nd');break;
            case 2: setSelectedShift('both');break;
        }
    }, [shiftMenu])

    return (
        <div className='cms-body'>
            <div className='cms-header-container'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>База данных волонтёров</h1>
                    <PersonAlertIcon className='cms-header-alert-icon' />
                </div>
                <span className='cms-header-role'>Гл.Координатор</span>
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
                    <div className='cms-headpanel-but-calendar-container'>
                        <CalendarIcon className='cms-headpanel-but-calendar-icon'/>
                        <span style={{ marginRight: '3px' }}>{currentDay+1} день</span>
                        <span>({days[currentDay]})</span>
                    </div>
                    <div className='cms-headpanel-linkinput-container' style={{ marginRight: '10px' }}>
                        <WhatsappIcon className='cms-headpanel-linkinput-icon'/>
                        <input type="text" className='cms-headpanel-linkinput-input' placeholder='Ссылка на группу' />
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
            <div className='cms-table-container'>
                <div className='cms-table-header'>
                    <div className='cms-table-cell a'>№</div>
                    <div className='cms-table-cell b'>ФИО</div>
                    <div className='cms-table-cell-more-wrapper'>
                        <div className='cms-table-cell c'>Позиция</div>
                        <div className='cms-table-cell d'>Экип</div>
                        <div className='cms-table-cell e'>Посещ</div>
                        <div className='cms-table-cell f'>Опозд</div>
                    </div>
                </div>
                <div className='cms-table-main'>
                    {volunteers.filter(item => item.shift === selectedShift).map((item, i) => item.id !== focusVolunteer ? (
                        <div 
                            className={`cms-table-object-container ${ item.blacklist ? 'bl' : item.warning ? 'warn' : item.role.toLowerCase()}`} 
                            onClick={() => setFocusVolunteer(item.id as number)
                        }>
                            <div className='cms-table-cell a'>{i+1}</div>
                            <div className='cms-table-cell b'>{item.account.name}</div>
                            <div className='cms-table-cell-more-wrapper'>
                                <div className='cms-table-cell c'>Позиция</div>
                                <div className='cms-table-cell d'>{item.equip ? item.equip === 'GET' ? 'Не сдал' : 'Сдал' : 'Не получил'}</div>
                                <div className='cms-table-cell e'>{item.visit ? 'Да' : 'Нет'}</div>
                                <div className='cms-table-cell f'>{item.late ? 'Да' : 'Нет'}</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div 
                                className={`cms-table-object-container ${ item.blacklist ? 'bl' : item.warning ? 'warn' : item.role.toLowerCase()} selected`} 
                                onClick={() => setFocusVolunteer(null)}
                            >
                                <div className='cms-table-cell a'>{i+1}</div>
                                <div className='cms-table-cell b'>{item.account.name}</div>
                                <div className='cms-table-cell-more-wrapper'>
                                    <div className='cms-table-cell c'>Позиция</div>
                                    <div className='cms-table-cell d'>{item.equip ? item.equip === 'GET' ? 'Не сдал' : 'Сдал' : 'Не получил'}</div>
                                    <div className='cms-table-cell e'>{item.visit ? 'Да' : 'Нет'}</div>
                                    <div className='cms-table-cell f'>{item.late ? 'Да' : 'Нет'}</div>
                                </div>
                            </div>
                            <div 
                                className={`cms-table-object-info-container ${ item.blacklist ? 'bl' : item.warning ? 'warn' : item.role.toLowerCase()}`} 
                                onClick={() => setFocusVolunteer(null)}
                            >
                                <div className='cms-table-object-more-wrapper'>
                                    <div className='cms-table-object-info-item-wrapper'>
                                        <span>Позиция</span>
                                        <div>Позиция</div>
                                    </div>
                                    <div className='cms-table-object-info-item-wrapper'>
                                        <span>Экип</span>
                                        <div>{item.equip ? item.equip === 'GET' ? 'Не сдал' : 'Сдал' : 'Не получил'}</div>
                                    </div>
                                    <div className='cms-table-object-info-item-wrapper'>
                                        <span>Посещ</span>
                                        <div>{item.visit ? 'Да' : 'Нет'}</div>
                                    </div>
                                    <div className='cms-table-object-info-item-wrapper'>
                                        <span>Опозд</span>
                                        <div>{item.late ? 'Да' : 'Нет'}</div>
                                    </div>
                                </div>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Роль</span>
                                    <div className={`cms-table-object-info-item-role-value ${item.role.toLowerCase()}`}>
                                        {item.role === 'VOL' ? 'Волонтёр' : item.role === 'CRD' ? 'Координатор' : 'Гл. Координатор'}
                                    </div>
                                </div>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Статус ЧС</span>
                                    <div className={`cms-table-object-info-item-warn-value ${item.blacklist ? 'bl' : item.warning ? 'warn' : ''}`}>
                                        {item.blacklist ? 'ЧС' : item.warning ? 'Предупреждение' : 'Нет'}
                                    </div>
                                </div>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Организация</span>
                                    <div>{item.guild}</div>
                                </div>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Телефон</span>
                                    <div>{item.account.contactWhatsapp}</div>
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
};