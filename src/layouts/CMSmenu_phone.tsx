import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ReactComponent as BarIcon } from "../assets/icons/bars-solid-full.svg"
import * as Types from '../../module/types/types.ts'

import './style/menu_phone.css'

type Props = {
    user: Types.Account | null
}

export const CMSMenuPHN = (props: Props) => {
    const [state, setState] = useState<boolean>(false)

    // Допуск к ATP странице
    const [ATPAccept, setATPAccept] = useState(false)

    useEffect(() => {
        if(props.user) setATPAccept(true)
    }, [props.user])

    return (
        <div className={`nav-phn-container ${state ? 'open' : 'closed'}`} onClick={ state ? () => {} : () => setState(true)}>
            <div className={`nav-phn-bar-icon-wrapper ${ state ? 'open' : 'closed' }`}><BarIcon width={40} height={40} fill={'#D9D9D9'}/></div>
            <div className={`nav-phn-inner ${state ? 'open' : 'closed'}`}>
                <div className='nav-phn-logo'>ALLIANCE</div>
                <div className='nav-phn-but-wrapper'>
                    <div className='nav-phn-container-but'>
                        <h2 className='nav-phn-menu-h2'>Панель учета волонтеров</h2>
                        <a href={ props.user ? `/user/${props.user.iin}${props.user.id}` : '/auth/signin'} className='nav-phn-but signin'>{ props.user ? 'Кабинет' : 'Войти' }</a>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/cms' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>База данных</NavLink>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/cms/requests' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Заявки</NavLink>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/cms/map' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Арена</NavLink>
                        <a 
                            href="/event/atp250" 
                            className='nav-phn-but std' 
                            style={{ 
                                display: ATPAccept ? 'block' : 'none', 
                                marginTop: '10px', 
                                textDecoration: 'underline', 
                                textDecorationThickness: '1px', 
                                textUnderlineOffset: '3px' 
                            }}>ATP250</a>
                    </div>
                    <div className='nav-phn-but-close' onClick={ !state ? () => {} : () => setState(false) } />
                </div>
            </div>
        </div>
    );
};