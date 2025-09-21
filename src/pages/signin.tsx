import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { errorLogger } from '../errorLogger.ts';
import { request } from '../serverRequest.ts';
import Loader from '../components/loader.tsx';

import * as Types from '../../module/types/types.ts'

import './style/auth.css'


type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Signin = ({ setErrorMessage }: Props) => {
    const navigate = useNavigate()

    // UI

    const [isPassShow, setIsPassShow] = useState(false)

    const [isLoad, setIsLoad] = useState<boolean>(false)


    // UX
    
    const [email, setEmail] = useState<string>("")
    const [pass, setPass] = useState<string>("")

    const confirm = async () => {
        try {
            setIsLoad(true)
            const res = await request({ method: 'POST', route: '/account/login', loadData: { email, password: pass } })

            const container = res.container as { userData: Types.Account, sessionData: { id: number, key: string } }

            const sessionData: string = JSON.stringify({ ...container.sessionData, userId: container.userData.id })

            setIsLoad(false)

            Cookies.set("session", sessionData)
            navigate('/')
        } catch (e: any) {
            setIsLoad(false)
            const response = e.response
            errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
        }
    }

    return (
        <div className='signin-body'>
            <div className='signin-container'>
                <h2>Вход</h2>
                <div className='signin-input-container'>
                    <h3>Почта</h3>
                    <input type="email" autoComplete='email' placeholder='example@gmail.com' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className='signin-input-container'>
                    <h3>Пароль</h3>
                    <input type={isPassShow ? 'text' : 'password'} autoComplete='current-password' placeholder='Пароль' value={pass} onChange={(e) => setPass(e.target.value)}/>
                    <button className='signin-but-showPass' onClick={() => setIsPassShow(!isPassShow)}>{ isPassShow ? 'Скрыть пароль' : 'Показать пароль' }</button>
                </div>
                <NavLink to='/auth/recovery' className='signin-but-forgotPass'>Я забыл пароль</NavLink>
                <div className='signin-bottom-container'>
                    <span>Еще не с нами?<NavLink to='/auth/signup' className='signin-bottom-but-createAccount'>Создать аккаунт</NavLink></span>
                    { isLoad ? <Loader /> : null }
                    <button style={{ display: !isLoad ? 'block' : 'none' }} className='signin-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
};