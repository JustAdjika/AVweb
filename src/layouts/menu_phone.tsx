import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { ReactComponent as BarIcon } from "../assets/icons/bars-solid-full.svg"
import * as Types from '../../module/types/types.ts'

import './style/menu_phone.css'

type Props = {
    user: Types.Account | null
}

export const MenuPHN = (props: Props) => {
    const [state, setState] = useState<boolean>(false)

    return (
        <div className={`nav-phn-container ${state ? 'open' : 'closed'}`} onClick={ state ? () => {} : () => setState(true)}>
            <div className={`nav-phn-bar-icon-wrapper ${ state ? 'open' : 'closed' }`}><BarIcon width={40} height={40} fill={'#D9D9D9'}/></div>
            <div className={`nav-phn-inner ${state ? 'open' : 'closed'}`}>
                <div className='nav-phn-logo'>ALLIANCE</div>
                <div className='nav-phn-but-wrapper'>
                    <div className='nav-phn-container-but'>
                        <a href={ props.user ? `/user/${props.user.iin}${props.user.id}` : '/auth/signin'} className='nav-phn-but std' style={{ marginBottom: '30px' }}>{ props.user ? 'Кабинет' : 'Войти' }</a>
                        <NavLink onClick={ () => setState(false) } to='/' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Главная</NavLink>
                        <NavLink onClick={ () => setState(false) } to='/about' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>О нас</NavLink>
                        <NavLink onClick={ () => setState(false) } to='/contacts' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Контакты</NavLink>
                        <NavLink onClick={ () => setState(false) } to='/projects' className={({ isActive }) => `nav-phn-but ${ isActive ? 'active' : 'std' }`}>Проекты</NavLink>
                        <a href="/event/atp250" className='nav-phn-but std' style={{ marginTop: '50px', textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '3px' }}>ATP250</a>
                    </div>
                    <div className='nav-phn-but-close' onClick={ !state ? () => {} : () => setState(false) } />
                </div>
            </div>
        </div>
    );
};