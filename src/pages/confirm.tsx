import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

import { errorLogger } from '../errorLogger.ts';
import { request } from '../serverRequest.ts';
import Loader from "../components/loader.tsx"

import * as Types from '../../module/types/types.ts'

import './style/auth.css'



type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Confirm = ({ setErrorMessage }: Props) => {
    const navigate = useNavigate()

    // UI
    const [isLoad, setIsLoad] = useState<boolean>(false)

    // UX
    const [confirmCode, setConfirmCode] = useState<string>("")
    const { token } = useParams() 

    const confirm = async() => {
        try {
            setIsLoad(true)
            const res = await request({ method: 'POST', route: `/account/emailconfirm/${token}`, loadData: { code: confirmCode } })

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
        <div className='confirm-body'>
            <div className='confirm-container'>
                <h2>Подтверждение почты</h2>

                <p>Мы отправили вам на почту код подтверждения. Введите его в поле ниже</p>

                <div className='signin-input-container'>
                    <h3>Код подтверждения</h3>
                    <input 
                        maxLength={6}
                        type="text" 
                        name='' 
                        autoComplete='off' 
                        placeholder='XXXXXX' 
                        value={confirmCode} 
                        onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                    />
                </div>

                <div className='signin-bottom-container' style={{ marginTop: '30px' }}>
                    <NavLink to='/auth/signup' className='confirm-bottom-escape'>Вернуться назад</NavLink>
                    { isLoad ? <Loader /> : null }
                    <button style={{ display: !isLoad ? 'block' : 'none', height: '40px' }} className='signin-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
};