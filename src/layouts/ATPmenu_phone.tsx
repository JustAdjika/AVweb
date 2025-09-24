import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ReactComponent as BarIcon } from "../assets/icons/bars-solid-full.svg"
import * as Types from '../../module/types/types.ts'

import './style/menu_phone.css'

type Props = {
    user: Types.Account | null
}

export const ATPMenuPHN = (props: Props) => {
    const [state, setState] = useState<boolean>(false)

    return (
        <div className={`nav-phn-container ${state ? 'open' : 'closed'}`} onClick={ state ? () => {} : () => setState(true)}>
            <div className={`nav-phn-bar-icon-wrapper ${ state ? 'open' : 'closed' }`}><BarIcon width={40} height={40} fill={'#D9D9D9'}/></div>
            <div className={`nav-phn-inner ${state ? 'open' : 'closed'}`}>
                <div className='nav-phn-logo'>ALLIANCE</div>
                <div className='nav-phn-but-wrapper'>
                    <div className='nav-phn-container-but'>
                        <a href={ props.user ? `/user/${props.user.iin}${props.user.id}` : '/auth/signin'} className='nav-phn-but std' style={{ marginBottom: '30px' }}>{ props.user ? 'Кабинет' : 'Войти' }</a>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Инфо</NavLink>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/map' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Арена</NavLink>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/register' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Запись</NavLink>
                        <NavLink end onClick={ () => setState(false) } to='/event/atp250/cms' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Панель</NavLink>
                    </div>
                    <div className='nav-phn-but-close' onClick={ !state ? () => {} : () => setState(false) } />
                </div>
            </div>
        </div>
    );
};