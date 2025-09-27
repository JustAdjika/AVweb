import { useEffect, useState } from 'react';

import { Event as EventClass } from '../class/eventClass.ts';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    shiftMenu: number,
    currentDay: number,
    event: EventClass | null,
    setErrorMessage: (msg: string | null) => void,
    days: string[],
    errorLogger: any,
    _dayLoaded: boolean,
    volunteers: (Types.VolunteerData & Types.moreVolsData)[],
    setVolunteers: (value: (Types.VolunteerData & Types.moreVolsData)[]) => any,
    handleContextMenu: (value: Types.VolunteerData & Types.moreVolsData, e:any) => void,
}

export const Volunteers = ({ shiftMenu, currentDay, event, days, setErrorMessage, errorLogger, _dayLoaded, setVolunteers, volunteers, handleContextMenu }: Props) => {

    const [focusVolunteer,setFocusVolunteer] = useState<number | null>(null)

    const [_volGot, _setVolGot] = useState(false)
    

    // Получение списка волонтёров

    useEffect(() => {
        if(_volGot || !event || !_dayLoaded) return 

        event.getVolunteers(setErrorMessage, days[currentDay])
            .then(res => { 
                if(res.status === 200) {
                    const container = res.container as (Types.VolunteerData & Types.moreVolsData)[]

                    setVolunteers(container)
                    _setVolGot(true)
                } else {
                    errorLogger(setErrorMessage, res)
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [event, _dayLoaded])



    // Определение выбранной смены

    const [selectedShift,setSelectedShift] = useState('1st')

    useEffect(() => {
        switch(shiftMenu) {
            case 0: setSelectedShift('1st');break;
            case 1: setSelectedShift('2nd');break;
            case 2: setSelectedShift('both');break;
        }
    }, [shiftMenu])


    return (
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
                {volunteers.filter(item => item.shift === selectedShift || item.shift === 'both').map((item, i) => item.id !== focusVolunteer ? (
                    <div 
                        className={`cms-table-object-container ${ item.blacklist ? 'bl' : item.warning ? 'warn' : item.role.toLowerCase()}`} 
                        onClick={() => setFocusVolunteer(item.id as number) }
                        onContextMenu={(e) => { e.preventDefault(); handleContextMenu(item, e) }}
                    >
                        <div className='cms-table-cell a'>{i+1}</div>
                        <div className='cms-table-cell b'>{item.account.name}</div>
                        <div className='cms-table-cell-more-wrapper'>
                            <div className='cms-table-cell c'>{item.inStaffRoom ? 'Штаб' : item.posName ? item.posName : 'Не назначен'}</div>
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
                            onContextMenu={(e) => { e.preventDefault(); handleContextMenu(item, e) }}
                        >
                            <div className='cms-table-cell a'>{i+1}</div>
                            <div className='cms-table-cell b'>{item.account.name}</div>
                            <div className='cms-table-cell-more-wrapper'>
                                <div className='cms-table-cell c'>{item.inStaffRoom ? 'Штаб' : item.posName ? item.posName : 'Не назначен'}</div>
                                <div className='cms-table-cell d'>{item.equip ? item.equip === 'GET' ? 'Не сдал' : 'Сдал' : 'Не получил'}</div>
                                <div className='cms-table-cell e'>{item.visit ? 'Да' : 'Нет'}</div>
                                <div className='cms-table-cell f'>{item.late ? 'Да' : 'Нет'}</div>
                            </div>
                        </div>
                        <div 
                            className={`cms-table-object-info-container ${ item.blacklist ? 'bl' : item.warning ? 'warn' : item.role.toLowerCase()}`} 
                            onClick={() => setFocusVolunteer(null)}
                            onContextMenu={(e) => { e.preventDefault(); handleContextMenu(item, e) }}
                        >
                            <div className='cms-table-object-more-wrapper'>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Позиция</span>
                                    <div>{item.inStaffRoom ? 'Штаб' : item.posName ? item.posName : 'Не назначен'}</div>
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
    );
};