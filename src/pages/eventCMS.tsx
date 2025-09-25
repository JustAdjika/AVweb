import React, { useState } from 'react';

import { ReactComponent as PersonAlertIcon } from '../assets/icons/person-circle-exclamation-solid-full.svg'
import { ReactComponent as CalendarIcon } from '../assets/icons/calendar-days-solid-full.svg'
import { ReactComponent as WhatsappIcon } from '../assets/icons/whatsapp-brands-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../assets/icons/qrcode-solid-full.svg'
import { ReactComponent as FileExportIcon } from '../assets/icons/file-arrow-down-solid-full.svg'


import './style/eventCMS.css'

type Props = {
    setErrorMesssage: (msg: string | null) => void
}

export const EventCMS = ({ setErrorMesssage }: Props) => {

    // UI

    const [selectedMenu, setSelectedMenu] = useState(0)

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
                <div className='cms-headpanel-center-wrapper'>
                    <div className='cms-headpanel-but-calendar-container'>
                        <CalendarIcon className='cms-headpanel-but-calendar-icon'/>
                        <span style={{ marginRight: '3px' }}>1 день</span>
                        <span>(11.10.25)</span>
                    </div>
                    <div className='cms-headpanel-linkinput-container'>
                        <WhatsappIcon className='cms-headpanel-linkinput-icon'/>
                        <input type="text" className='cms-headpanel-linkinput-input' placeholder='Ссылка на группу' />
                    </div>
                </div>
            </div>
            <div className='cms-headpanel-functions-but-container'>
                <div className='cms-headpanel-qr-but-container'>
                    <QRcodeIcon className='cms-headpanel-function-but-icon'/>
                    <span>QR</span>
                </div>
                <div className='cms-headpanel-export-but-container'>
                    <FileExportIcon className='cms-headpanel-function-but-icon'/>
                    <span>Экспорт</span>
                </div>
            </div>
            {/* Роль, ЧС - определять по цветовой палитре */}
            {/* ОРГ, Телефон - из раскрывающегося меню */}
            <div className='cms-table-container'>
                <div className='cms-table-header'>
                    <div className='cms-table-cell a'>№</div>
                    <div className='cms-table-cell b'>ФИО</div>
                    <div className='cms-table-cell c'>Позиция</div>
                    <div className='cms-table-cell d'>Экип</div>
                    <div className='cms-table-cell e'>Посещ</div>
                    <div className='cms-table-cell f'>Опозд</div>
                </div>
                <div className='cms-table-main'>
                    <div className='cms-table-object-container vol selected'>
                        <div className='cms-table-cell a'>1</div>
                        <div className='cms-table-cell b'>Серкебаев Мирас Ермекович</div>
                        <div className='cms-table-cell c'>Позиция</div>
                        <div className='cms-table-cell d'>Не получил</div>
                        <div className='cms-table-cell e'>Да</div>
                        <div className='cms-table-cell f'>Нет</div>
                    </div>
                    <div className='cms-table-object-info-container'>
                        <div>Роль: Волонтёр</div>
                        <div>Статус ЧС: Предупреждение</div>
                        <div>Организация: AV</div>
                        <div>Телефон: +7 (777) 249 9099</div>
                    </div>
                    <div className='cms-table-object-container'>
                        <div className='cms-table-cell a'>1</div>
                        <div className='cms-table-cell b'>Серкебаев Мирас Ермекович</div>
                        <div className='cms-table-cell c'>Позиция</div>
                        <div className='cms-table-cell d'>Не получил</div>
                        <div className='cms-table-cell e'>Да</div>
                        <div className='cms-table-cell f'>Нет</div>
                    </div>
                </div>
            </div>
        </div>
    );
};