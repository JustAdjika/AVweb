import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ReactComponent as BarIcon } from "../assets/icons/bars-solid-full.svg"
import { request } from '../module/serverRequest.ts';

import * as Types from '../../module/types/types.ts'

import './style/menu_phone.css'

type Props = {
    user: Types.Account | null
}

export const ATPMenuPHN = (props: Props) => {
    const [state, setState] = useState<boolean>(false)

    const [event, setEvent] = useState<Types.Event | null>(null)

    const [isCRD, setIsCRD] = useState<boolean>(false)
    const [isVol, setIsVol] = useState<boolean>(false)


    // Получение события
    useEffect(() => {
        if(event) return
        
        request({method: 'GET', route: 'event/data/byName', loadQuery: { name: 'ATP 250' }})
            .then(res => {
                if(res.status === 200) {
                    const container = res.container as { event: Types.preParsedEvent }

                    const parsedEvent: Types.Event = {
                        ...container.event,
                        days: JSON.parse(container.event.days),
                        guilds: JSON.parse(container.event.guilds),
                        info: JSON.parse(container.event.info),
                        uniqueInfo: JSON.parse(container.event.uniqueInfo)
                    }

                    setEvent(parsedEvent)
                }
            })
    }, [props.user])


    // Проверка прав
    useEffect(() => {
        if (!event) return;
        if (!props.user) return;

        const checkCRD = async () => {
            const eventDays = event.days;

            try {
                const results = await Promise.all(
                eventDays.map(async (day) => {
                    const res = await request({
                        method: "GET",
                        route: `perms/event/${event.id}/is/CRD`,
                        loadQuery: { userId: props.user?.id, day },
                    });

                    if (res.status === 200) {
                        const container = res.container as { result: boolean };
                        return container.result;
                    }
                    return false;
                })
            );

            if (results.some(Boolean)) {
                setIsCRD(true);
            }
            } catch (err) {
            console.error(err);
            }
        };

        const checkVol = async () => {
            const eventDays = event.days;

            try {
                const results = await Promise.all(
                eventDays.map(async (day) => {
                    const res = await request({
                        method: "GET",
                        route: `perms/event/${event.id}/is/VOL`,
                        loadQuery: { userId: props.user?.id, day },
                    });

                    if (res.status === 200) {
                        const container = res.container as { result: boolean };
                        return container.result;
                    }
                    return false;
                })
            );

            if (results.some(Boolean)) {
                setIsVol(true);
            }
            } catch (err) {
            console.error(err);
            }
        };

        checkCRD();
        checkVol();
    }, [event, props.user])

    return (
        <div className={`nav-phn-container ${state ? 'open' : 'closed'}`} onClick={ state ? () => {} : () => setState(true)}>
            <div className={`nav-phn-bar-icon-wrapper ${ state ? 'open' : 'closed' }`}><BarIcon width={40} height={40} fill={'#D9D9D9'}/></div>
            <div className={`nav-phn-inner ${state ? 'open' : 'closed'}`}>
                <div className='nav-phn-logo'>ALLIANCE</div>
                <div className='nav-phn-but-wrapper'>
                    <div className='nav-phn-container-but'>
                        <a href={ props.user ? `/user/${props.user.iin}${props.user.id}` : '/auth/signin'} className='nav-phn-but std' style={{ marginBottom: '30px' }}>{ props.user ? 'Кабинет' : 'Войти' }</a>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Инфо</NavLink>
                        <NavLink style={{ display: isVol ? 'flex' : 'none' }} end onClick={ () => setState(false) } to='/event/atp250/map' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Арена</NavLink>
                        <NavLink style={{ display: !isVol ? 'flex' : 'none' }} end onClick={ () => setState(false) } to='/event/atp250/register' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Запись</NavLink>
                        <NavLink style={{ display: isCRD ? 'flex' : 'none' }} end onClick={ () => setState(false) } to='/event/atp250/cms' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Панель</NavLink>
                    </div>
                    <div className='nav-phn-but-close' onClick={ !state ? () => {} : () => setState(false) } />
                </div>
            </div>
        </div>
    );
};