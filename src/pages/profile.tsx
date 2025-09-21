import { Account } from "../components/class/accountClass";
import { useState } from "react";

import { ReactComponent as InfoIcon } from '../assets/icons/circle-info-solid-full.svg'
import { ReactComponent as PenIcon } from '../assets/icons/pen-solid-full.svg'
import { ReactComponent as KeyIcon } from '../assets/icons/key-solid-full.svg'
import { ReactComponent as ImportIcon } from '../assets/icons/file-import-solid-full.svg'
import { ReactComponent as ShirtIcon } from '../assets/icons/shirt-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../assets/icons/qrcode-solid-full.svg'

import { Footer } from "../components/footer";



import './style/profile.css'

type Props = {
    setErrorMessage: (message: string | null) => void
}

export const Profile = ({ setErrorMessage }: Props) => {
    
    // UI

    const [personalInfoNote, setPersonalInfoNote] = useState<boolean>(false)
 


    return (
        <>
            <div className="profile-body">

                <div className="profile-header-container">
                    <h1>Кабинет пользователя</h1>
                    <div className="profile-role"><span>AV Волонтер</span></div>
                </div>

                <div className="profile-pesonalinfo-wrapper">
                    <div className="profile-personalinfo-header">
                        <h2>Личная информация</h2>
                        <InfoIcon 
                            fill={ !personalInfoNote ? '#55868C' : '#3a5c61ff'} 
                            width={30} 
                            height={30} 
                            style={{ 
                                transition: '0.3s ease-in-out', 
                                width: '30px', 
                                height: '30px', 
                                position: 'relative', 
                                top: '1px'
                            }} 
                            onMouseEnter={() => setPersonalInfoNote(true)} 
                            onMouseLeave={() => setPersonalInfoNote(false)} 
                        />
                        <div className={`profile-personalinfo-note ${personalInfoNote ? 'visible' : ''}`}>
                            <span>Для изменения личной информации, обратитесь в <a href="https://www.youtube.com/" style={{ color: '#066DA7', pointerEvents: !personalInfoNote ? 'none' : 'auto' }}>тех поддержку</a></span>
                        </div>
                    </div>
                    <div className="profile-personalinfo-container">
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">ФИО:</span>
                            <span className="profile-personalinfo-option-value">Серкебаев Мирас Ермекович</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">Дата рождения:</span>
                            <span className="profile-personalinfo-option-value">04/01/08</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">ИИН:</span>
                            <span className="profile-personalinfo-option-value">080104551740</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">Регион:</span>
                            <span className="profile-personalinfo-option-value">Алматы</span>
                        </div>
                    </div>
                </div>
                <div className="profile-contactinfo-wrapper">
                    <h2>Контактная информация</h2>
                    <div className="profile-contactinfo-container">
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Почта:</span>
                            <span className="profile-contactinfo-option-value">fenixxfns@gmail.com</span>
                        </div>
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Телефон (Whatsapp):</span>
                            <span className="profile-contactinfo-option-value">+7 (777) 249 9099</span>
                        </div>
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Телефон (Kaspi):</span>
                            <span className="profile-contactinfo-option-value">+7 (777) 249 9099</span>
                        </div>
                    </div>
                    <div className="profile-contactinfo-footer">
                        <button className="profile-contactinfo-edit">
                            <PenIcon fill='#1a1a1a' width={30} height={30} style={{ width: '20px', height: '20px', position: 'relative', top: '1px'}} />
                            <span>Изменить</span>
                        </button>
                        <button className="profile-contactinfo-edit">
                            <KeyIcon fill='#1a1a1a' width={30} height={30} style={{ width: '20px', height: '20px', position: 'relative', top: '1px'}} />
                            <span>Изменить пароль</span>
                        </button>
                    </div>
                </div>
                <div className="profile-personconfirm-container">
                    <h2>Подтверждение личности</h2>
                    <p>Наша организация требует удостоверение личности, для подтверждения указанных данных. Поэтому для участия в любых мероприятиях, вам нужно отправить фотографию лицевой стороны удостверения личности (Сторона с вашей фотографией, именем, ИИН и датой рождения). Через время администрация проверит его и выдаст подтверждение </p>
                    <div className="profile-personconfirm-status-container">
                        <span className="profile-personconfirm-status-title">Статус:</span>
                        <span className="profile-personconfirm-status-value" style={{ color: '#840C00' }}>Не подтвержден</span>
                    </div>
                    <label htmlFor="profileIdCardInput" className="profile-personconfirm-input">
                        <ImportIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px'}}/>
                        <span>Выбрать файл</span>
                    </label>
                    <input style={{ display: 'none' }} type="file" id="profileIdCardInput" />
                </div>
                <div className="profile-qr-container">
                    <button>
                        <QRcodeIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px'}}/>
                        QR код Профиля
                    </button>
                    <button>
                        <ShirtIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px', marginRight: '5px'}} />
                        Получить экипировку
                    </button>
                    <button>Сдать экипировку</button>
                </div>
            </div>
            <Footer />
        </>
    );
};