import { useState } from 'react';
import '../../pages/style/eventCMS.css'

import { Config } from '../../../config';

type Props = {
    profileMenu: boolean,
    setProfileMenu: (value: boolean) => any
}

export const ProfileModal = ({ profileMenu, setProfileMenu }: Props) => {

    const config = new Config()

    const [showIdCard, setShowIdCard] = useState<boolean>(false)

    const [atpDays, setAtpDays] = useState<string[]>(["11.10.25", "12.10.25", "14.10.25"])

    const [foundUser, setFoundUser] = useState({
        id: 8,
        name: "Серкебаев Мирас",
        birthday: "04/01/08",
        iin: "080104551740",
        region: "almaty",
        email: "fenixxfns2@gmail.com",
        contactKaspi: "+7 (777) 249 9099",
        contactWhatsapp: "+7 (777) 249 9099",
        idCardId: "idCard_415f1d64-df1b-49f2-b95e-17a935a39412.png",
        personalQrId: "79369b15-f9e0-48b3-8e0b-d50237b44994.png",
        registerAt: "2025-09-10T13:49:29.000Z",
        idCardConfirm: "UNCERTAIN",
        supervisorId: 7,
        createdAt: "2025-09-10T13:49:29.000Z",
        updatedAt: "2025-09-10T13:49:29.000Z"
    })


    return (
        <div className="profile-qrmodal-wrapper" style={{ display: profileMenu ? 'flex' : 'none' }} onClick={() => setProfileMenu(false)}>
            <div className="event-profile-container" onClick={(e) => e.stopPropagation()}>
                <h2>Профиль пользователя</h2>
                <div className='event-profile-main-wrapper'>
                    <div className='event-profile-personal-wrapper'>
                        <h3>Личная информация</h3>
                        <div className='event-profile-personal-container'>
                            <div className='event-profile-personal-item-container'>
                                <span className='event-profile-personal-item-title'>ФИО:</span>
                                <span className='event-profile-personal-item-value'>{foundUser.name}</span>
                            </div>
                            <div className='event-profile-personal-item-container'>
                                <span className='event-profile-personal-item-title'>Д/Р:</span>
                                <span className='event-profile-personal-item-value'>{foundUser.birthday}</span>
                            </div>
                            <div className='event-profile-personal-item-container'>
                                <span className='event-profile-personal-item-title'>ИИН:</span>
                                <span className='event-profile-personal-item-value'>{foundUser.iin}</span>
                            </div>
                            <div className='event-profile-personal-item-container'>
                                <span className='event-profile-personal-item-title'>Регион:</span>
                                <span className='event-profile-personal-item-value'>{foundUser.region}</span>
                            </div>
                        </div>
                    </div>
                    <div className='event-profile-personal-wrapper'>
                        <h3>{ !showIdCard ? 'Контактные данные' : 'Удостоверение личности' }</h3>
                        { !showIdCard ? (
                            <div className='event-profile-personal-container'>
                                <div className='event-profile-contact-item-container'>
                                    <span className='event-profile-contact-item-title'>Почта:</span>
                                    <span className='event-profile-contact-item-value'>{foundUser.name}</span>
                                </div>
                                <div className='event-profile-contact-item-container'>
                                    <span className='event-profile-contact-item-title'>Телефон (Whatsapp):</span>
                                    <span className='event-profile-contact-item-value'>{foundUser.birthday}</span>
                                </div>
                                <div className='event-profile-contact-item-container'>
                                    <span className='event-profile-contact-item-title'>Телефон (Kaspi)</span>
                                    <span className='event-profile-contact-item-value'>{foundUser.iin}</span>
                                </div>
                            </div>
                        ) : (
                            <div className='event-profile-personal-idcard-container' style={{ backgroundImage: `url('${config.serverDomain}/uploads/idCard/${foundUser.idCardId}')` }}/>
                        ) }
                    </div>
                </div>
                <div className='event-profile-footer-wrapper'>
                    <button onClick={() => setShowIdCard(!showIdCard)}>Удостоверение</button>
                    <span>Дни ATP: {atpDays.map( day => `${day.split('.')[0]}, `)}</span>
                </div>
            </div>
        </div>
    );
};