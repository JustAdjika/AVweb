import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

import { Volunteer } from '../class/volunteerClass.ts';
import { errorLogger } from '../../module/errorLogger.ts';
import { menuConfig } from '../../contextMenu.config.ts';

import * as Types from '../../../module/types/types.ts'
import * as contextMenuTypes from '../../contextMenu.config.ts';

type Props = {
    menuVisible: boolean,
    setMenuVisible: (value: boolean) => any,
    contextMenuData: Types.contextMenuData,
    setProfileMenu: (value: boolean) => any,
    setTargetUser: (value: number) => any,
    volunteers: (Types.VolunteerData & Types.moreVolsData)[],
    setErrorMessage: (msg: string | null) => void,
    setVolunteers: any,
    userRole: Types.eventPermission | null
}





export const ContextMenu = ({ userRole, menuVisible, setMenuVisible, contextMenuData, setProfileMenu, setTargetUser, volunteers, setErrorMessage, setVolunteers }: Props) => {

    const menuRef = useRef<HTMLUListElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const [volunteerClass, setVolunteerClass] = useState<Volunteer | null>(null)

    const [menuType, setMenuType] = useState<contextMenuTypes.menuType>('target_yourself')


    useEffect(() => {
        if(!contextMenuData.e) return

        const session = Cookies.get("session")
        if(!session) return
        const parsedSession: Types.Session = JSON.parse(session)

        if(contextMenuData.type === 'volunteer') {
            if(contextMenuData.userId === parsedSession.userId && userRole === 'HCRD') setMenuType('target_yourself_hcrd')
            else if(contextMenuData.userId === parsedSession.userId) setMenuType('target_yourself')
            else if(userRole === 'HCRD') setMenuType('for_hcrd')
            else if(contextMenuData.isCRD) setMenuType('target_coordinator')
            else setMenuType('target_classic')
        } else if(contextMenuData.type === 'position') {
            if(userRole === 'CRD') setMenuType('position')
            else setMenuType('position_hcrd')
        }
    }, [contextMenuData])




    const menuFunctions = {
        // Кнопка "Профиль"

        handleProfile: (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            setTimeout(() => {
                setMenuVisible(false); 
                setTargetUser(contextMenuData.userId as number); 
                setProfileMenu(true)
            }, 400)
        },


        // Кнопка Отметить/Отменить посещение 

        handleVisit: (e: any) => {
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
        },




        // Кнопка "Отметить/отменить опоздание"

        handleLate: (e: any) => {
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
        },





        // Кнопка "Выдать предупреждение/ЧС"

        handleWarn: (e: any) => {
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
        },





        // Кнопка "Повысить/Понизить"

        changeCRD: (e: any) => {
            if(!volunteerClass) return

            e.preventDefault()
            e.stopPropagation()
            setTimeout(() => {
                setMenuVisible(false);
            
                volunteerClass.changeCRD()
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
        },
    }

    const contextMenuConfig = new menuConfig(menuFunctions, contextMenuData)



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
            {
                contextMenuConfig?.options[menuType].map((option) => (
                    <li className='cms-contextmenu-item-container' onClick={ (e) => option.function(e) }>
                        <div className='cms-contextmenu-item-icon-container'>
                            <option.icon width={20} height={20} fill={option.color}/>
                        </div>
                        {option.name}
                    </li>
                ))
            }
        </ul>
    )
};