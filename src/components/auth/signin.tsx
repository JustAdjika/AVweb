import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { Footer } from '../../components/footer';
import { Config } from '../../../config';
import { errorLogger } from '../../errorLogger.ts';
import { request } from '../../serverRequest.ts';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/auth.css'


type PropsSlide = {
    info: {
        title: string,
        date: string,
        staffs: number,
        img: string
    }
}

type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Signin = ({ setErrorMessage }: Props) => {
    const config = new Config()
    const navigate = useNavigate()

    // UI

    const [isPassShow, setIsPassShow] = useState(false)


    // UX
    
    const [email, setEmail] = useState<string>("")
    const [pass, setPass] = useState<string>("")

    const confirm = async () => {
        try {
            const res = await request({ method: 'POST', route: '/account/login', loadData: { email, password: pass } })

            const container = res.container as { accountData: Types.Account, sessionData: { id: number, key: string } }

            const sessionData: string = JSON.stringify(container.sessionData)

            Cookies.set("session", sessionData)
            navigate('/')
        } catch (e: any) {
            const response = e.response
            errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
        }
    }

    return (
        <div className='auth-signin-container'>
            <h2>Вход</h2>
            <div className='auth-input-container'>
                <h3>Почта</h3>
                <input type="email" autoComplete='email' placeholder='example@gmail.com' value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className='auth-input-container'>
                <h3>Пароль</h3>
                <input type={isPassShow ? 'text' : 'password'} autoComplete='current-password' placeholder='Пароль' value={pass} onChange={(e) => setPass(e.target.value)}/>
                <button className='auth-but-showPass' onClick={() => setIsPassShow(!isPassShow)}>{ isPassShow ? 'Скрыть пароль' : 'Показать пароль' }</button>
            </div>
            <NavLink to='/auth/recovery' className='auth-but-forgotPass'>Я забыл пароль</NavLink>
            <div className='auth-bottom-container'>
                <span>Еще не с нами?<NavLink to='/auth/signup' className='auth-bottom-but-createAccount'>Создать аккаунт</NavLink></span>
                <button className='auth-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
            </div>
        </div>
    );
};