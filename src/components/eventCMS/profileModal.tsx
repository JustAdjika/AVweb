import { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

import { Config } from '../../../config';
import Loader from '../../components/loader.tsx';
import { api } from '../../module/axiosConfig';
import { request } from '../../module/serverRequest.ts';

import { Event as EventClass } from '../class/eventClass.ts';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    profileMenu: boolean,
    setProfileMenu: (value: boolean) => any,
    handleDownloadIdCard: (id: number) => any,
    userId: number | null,
    event: EventClass
}

export const ProfileModal = ({ profileMenu, setProfileMenu, handleDownloadIdCard, userId, event }: Props) => {

    const config = new Config()

    const [loader, setLoader] = useState<boolean>(true)

    const [showIdCard, setShowIdCard] = useState<boolean>(false)

    const [atpDays, setAtpDays] = useState<string[]>([])

    const [foundUser, setFoundUser] = useState<Types.Account | null>(null)



    // Получение пользователя

    useEffect(() => {
        if(!userId || foundUser) return

        const session = Cookies.get("session")

        if(!session) return

        const parsedSession: Types.Session = JSON.parse(session)

        const getUserData = async() => {
            const res: Types.Response = await request({ 
                method: 'POST', 
                route: `/account/data/search`, 
                loadQuery: { id: userId},  
                loadData : {
                    sessionId: parsedSession.id,
                    sessionKey: parsedSession.key
                }
            })

            if(res.status === 200) {
                const container = res.container as { data: Types.Account }
                setFoundUser(container.data)
            }
        }

        try {
            getUserData()
        } catch (err) {
            return console.error(err)
        }
    }, [userId])



    // Получение дней пользователя

    useEffect(() => {
        if(!foundUser || atpDays.length !== 0 || !event) return

        const getDays = async () => {
            const eventDays = event.data.days

            try {
                const results = await Promise.all(
                    eventDays.map(async (day) => {
                        const res = await request({
                            method: "GET",
                            route: `perms/event/${event.data.id}/is/VOL`,
                            loadQuery: { userId: foundUser.id, day },
                        });

                        if (res.status === 200) {
                            const container = res.container as { result: boolean };
                            return { day, result: container.result } as { day: string, result: boolean }
                        }
                        return { day, result: false };
                    })
                );

                const days = results
                    .filter((item): item is { day: string; result: boolean } => !!item)
                    .map(i => i.day);

                setAtpDays(days)
            } catch (err) {
                console.error(err);
            }
        };

        getDays().then(() => setLoader(false))
    }, [foundUser])


    return (
        <div className="profile-qrmodal-wrapper" style={{ display: profileMenu ? 'flex' : 'none' }} onClick={() => setProfileMenu(false)}>
            <div className="event-profile-container" onClick={(e) => e.stopPropagation()} style={ loader ? { display: 'flex', justifyContent: 'center', alignItems: 'center' } : {} }>
                <h2 style={ loader ? { display: 'none' } : {}}>Профиль пользователя</h2>
                { loader ? <Loader /> : ( <>
                    <div className='event-profile-main-wrapper'>
                        <div className='event-profile-personal-wrapper'>
                            <h3>Личная информация</h3>
                            <div className='event-profile-personal-container'>
                                <div className='event-profile-personal-item-container'>
                                    <span className='event-profile-personal-item-title'>ФИО:</span>
                                    <span className='event-profile-personal-item-value'>{foundUser?.name}</span>
                                </div>
                                <div className='event-profile-personal-item-container'>
                                    <span className='event-profile-personal-item-title'>Д/Р:</span>
                                    <span className='event-profile-personal-item-value'>{foundUser?.birthday}</span>
                                </div>
                                <div className='event-profile-personal-item-container'>
                                    <span className='event-profile-personal-item-title'>ИИН:</span>
                                    <span className='event-profile-personal-item-value'>{foundUser?.iin}</span>
                                </div>
                                <div className='event-profile-personal-item-container'>
                                    <span className='event-profile-personal-item-title'>Регион:</span>
                                    <span className='event-profile-personal-item-value'>{foundUser?.region}</span>
                                </div>
                            </div>
                        </div>
                        <div className='event-profile-personal-wrapper'>
                            <h3>{ !showIdCard ? 'Контактные данные' : 'Удостоверение личности' }</h3>
                            { !showIdCard ? (
                                <div className='event-profile-personal-container'>
                                    <div className='event-profile-contact-item-container'>
                                        <span className='event-profile-contact-item-title'>Почта:</span>
                                        <span className='event-profile-contact-item-value'>{foundUser?.name}</span>
                                    </div>
                                    <div className='event-profile-contact-item-container'>
                                        <span className='event-profile-contact-item-title'>Телефон (Whatsapp):</span>
                                        <span className='event-profile-contact-item-value'>{foundUser?.birthday}</span>
                                    </div>
                                    <div className='event-profile-contact-item-container'>
                                        <span className='event-profile-contact-item-title'>Телефон (Kaspi)</span>
                                        <span className='event-profile-contact-item-value'>{foundUser?.iin}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className='event-profile-personal-idcard-container' style={{ backgroundImage: `url('${config.serverDomain}/uploads/idCard/${foundUser?.idCardId}')` }}/>
                            ) }
                        </div>
                    </div>
                    <div className='event-profile-footer-wrapper'>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button onClick={() => setShowIdCard(!showIdCard)}>Удостоверение</button>
                            <span onClick={() => handleDownloadIdCard(foundUser?.id as number)}>Скачать</span>
                        </div>
                        <span>Дни ATP: {atpDays.map( day => `${day.split('.')[0]}, `)}</span>
                    </div>
                </>)}
            </div>
        </div>
    );
};