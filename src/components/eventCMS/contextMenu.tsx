import { useState, useEffect, useRef } from 'react';

import { Volunteer } from '../class/volunteerClass.ts';
import { errorLogger } from '../../module/errorLogger.ts';

import { ReactComponent as UserIcon } from '../../assets/icons/user-solid-full.svg'
import { ReactComponent as UserCheckIcon } from '../../assets/icons/user-check-solid-full.svg'
import { ReactComponent as ClockIcon } from '../../assets/icons/clock-solid-full.svg'
import { ReactComponent as PromoteIcon } from '../../assets/icons/arrow-up-short-wide-solid-full.svg'
import { ReactComponent as ReduceIcon } from '../../assets/icons/arrow-down-short-wide-solid-full.svg'
import { ReactComponent as LocationIcon } from '../../assets/icons/location-dot-solid-full.svg'
import { ReactComponent as WarnIcon } from '../../assets/icons/triangle-exclamation-solid-full.svg'
import { ReactComponent as BanIcon } from '../../assets/icons/ban-solid-full.svg'

import * as Types from '../../../module/types/types.ts'

type Props = {
    menuVisible: boolean,
    setMenuVisible: (value: boolean) => any,
    contextMenuData: Types.contextMenuData,
    setProfileMenu: (value: boolean) => any,
    setTargetUser: (value: number) => any,
    volunteers: (Types.VolunteerData & Types.moreVolsData)[],
    setErrorMessage: (msg: string | null) => void,
    setVolunteers: any
}



export const ContextMenu = ({ menuVisible, setMenuVisible, contextMenuData, setProfileMenu, setTargetUser, volunteers, setErrorMessage, setVolunteers }: Props) => {

    const menuRef = useRef<HTMLUListElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const [volunteerClass, setVolunteerClass] = useState<Volunteer | null>(null)


    // Кнопка "Профиль"

    const handleProfile = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        setTimeout(() => {
            setMenuVisible(false); 
            setTargetUser(contextMenuData.userId as number); 
            setProfileMenu(true)
        }, 400)
    }


    // Кнопка Отметить/Отменить посещение 

    const handleVisit = (e: any) => {
        if(!volunteerClass) return

        e.preventDefault()
        e.stopPropagation()
        setTimeout(() => {
            setMenuVisible(false);
        
            volunteerClass.visitChange()
                .then(res=> {
                    if(res?.status === 200) {
                        setVolunteers((prev: (Types.VolunteerData & Types.moreVolsData)[]) => 
                            prev.map(vol =>
                                vol.id === volunteerClass.data.id ? volunteerClass.data : vol
                            )
                        )
                    }
                })
                .catch(err => {
                    const response = err?.response?.data
                    errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
                })
        }, 400)
    }




    // Кнопка "Отметить/отменить опоздание"

    const handleLate = (e: any) => {
        if(!volunteerClass) return

        e.preventDefault()
        e.stopPropagation()
        setTimeout(() => {
            setMenuVisible(false);
        
            volunteerClass.lateChange()
                .then(res=> {
                    if(res?.status === 200) {
                        setVolunteers((prev: (Types.VolunteerData & Types.moreVolsData)[]) => 
                            prev.map(vol =>
                                vol.id === volunteerClass.data.id ? volunteerClass.data : vol
                            )
                        )
                    }
                })
                .catch(err => {
                    const response = err?.response?.data
                    errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
                })
        }, 400)
    }





    // Кнопка "Выдать предупреждение/ЧС"

    const handleWarn = (e: any) => {
        if(!volunteerClass) return

        e.preventDefault()
        e.stopPropagation()
        setTimeout(() => {
            setMenuVisible(false);
        
            volunteerClass.warnChange()
                .then(res=> {
                    if(res?.status === 200) {
                        setVolunteers((prev: (Types.VolunteerData & Types.moreVolsData)[]) => 
                            prev.map(vol =>
                                vol.id === volunteerClass.data.id ? volunteerClass.data : vol
                            )
                        )
                    }
                })
                .catch(err => {
                    const response = err?.response?.data
                    errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
                })
        }, 400)
    }



    // Параметры координат экрана

    const [menuShow, setMenuShow] = useState(false)

    useEffect(() => {
        setMenuVisible(true)
    }, [contextMenuData])

    useEffect(() => {
        if(!menuVisible) setMenuShow(false)
    }, [menuVisible])

    useEffect(() => {
        if (menuVisible && contextMenuData.e && menuRef.current) {
            const clickX = contextMenuData.e.pageX;
            const clickY = contextMenuData.e.pageY;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const menuW = menuRef.current.offsetWidth;
            const menuH = menuRef.current.offsetHeight;

            let newX = clickX;
            let newY = clickY;


            if (clickX + menuW > screenW) newX = clickX - menuW;
            if (clickY + menuH > screenH) newY = clickY - menuH;

            setPosition({ x: newX, y: newY });
            setMenuShow(true)
        }
    }, [menuVisible]);



    // Закрытие при изменении размера экрана
    useEffect(() => {
        const closeMenu = () => { setMenuVisible(false); setMenuShow(false) }

        window.addEventListener('resize', closeMenu);
        window.addEventListener('orientationchange', closeMenu);
        return () => {
            window.removeEventListener('resize', closeMenu);
            window.removeEventListener('orientationchange', closeMenu);
        };
    }, []);




    // Получение класса волонтера

    useEffect(() => {
        if(!contextMenuData.e) return

        const filteredVolunteer = volunteers.filter(vol => vol.userId === contextMenuData.userId)
        Volunteer.create(setErrorMessage, filteredVolunteer[0])
            .then(item => {
                if(item) setVolunteerClass(item)
            })
    }, [contextMenuData])





    
    return (
        <ul
            ref={menuRef}
            className={`cms-contextmenu ${menuVisible ? 'visible' : ''}`}
            style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                listStyle: "none",
                visibility: menuShow ? 'visible' : 'hidden',
            }}
        >
            <li className='cms-contextmenu-item-container' onClick={ (e) => handleProfile(e) }>
                <div className='cms-contextmenu-item-icon-container'>
                    <UserIcon width={20} height={20} fill='#333'/>
                </div>
                Профиль
            </li>
            <li className='cms-contextmenu-item-container' onClick={ (e) => handleVisit(e) }>
                <div className='cms-contextmenu-item-icon-container'>
                    { !contextMenuData.visit ? 
                        <UserCheckIcon width={20} height={20} fill='#333'/>
                    :
                        <BanIcon width={20} height={20} fill='#333'/>
                    }
                </div>
                {contextMenuData.visit ? 'Отметить отсутствие' : 'Отметить посещение'}
            </li>
            <li className='cms-contextmenu-item-container' onClick={ (e) => handleLate(e) }>
                <div className='cms-contextmenu-item-icon-container'>
                    { !contextMenuData.late ? 
                        <ClockIcon width={20} height={20} fill='#333'/>
                    :
                        <BanIcon width={20} height={20} fill='#333'/>
                    }
                </div>
                {contextMenuData.late ? 'Отменить опоздание' : 'Отметить опоздание'}
            </li>
            <li className='cms-contextmenu-item-container' onClick={ (e) => {e.preventDefault(); e.stopPropagation() } }>
                <div className='cms-contextmenu-item-icon-container'>
                    { contextMenuData.isCRD ? 
                        <ReduceIcon width={20} height={20} fill='#333'/>
                    :
                        <PromoteIcon width={20} height={20} fill='#333'/>
                    }
                </div>
                {contextMenuData.isCRD ? 'Назначить волонтёром' : 'Назначить координатором'}
            </li>
            <li className='cms-contextmenu-item-container' onClick={ (e) => {e.preventDefault(); e.stopPropagation() } }>
                <div className='cms-contextmenu-item-icon-container'>
                    <LocationIcon width={20} height={20} fill='#333'/>
                </div>
                Назначить позицию
            </li>
            <li className='cms-contextmenu-item-container red' onClick={ (e) => handleWarn(e) }>
                <div className='cms-contextmenu-item-icon-container'>
                    { !contextMenuData.warn ? 
                        <WarnIcon width={20} height={20} fill='#C0392B'/>
                    :
                        <BanIcon width={20} height={20} fill='#C0392B'/>
                    }
                </div>
                {contextMenuData.bl ? 'Удалить из ЧС' : contextMenuData.warn ? 'Отправить в ЧС' : 'Предупреждение'}
            </li>
        </ul>
    )
};