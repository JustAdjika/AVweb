import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';
import Loader from "../components/loader.tsx"

import './style/auth.css'


type Props = {
    setErrorMessage: (message: string | null) => void
}


export const RecoveryLink = ({ setErrorMessage }: Props) => {
    const navigate = useNavigate()

    const { search } = useLocation()
    const query = new URLSearchParams(search)

    const token = query.get("token")

    // UI
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [isPassShow, setIsPassShow] = useState<boolean>(false)

    // UX
    const [newPass, setNewPass] = useState<string>("")

    const confirm = async() => {
        if(newPass.length < 8) return errorLogger(setErrorMessage, { status: 400, message: 'Длина пароля должна быть не менее 8 символов' })

        try {
            setIsLoad(true)
            await request({ method: 'POST', route: `/account/password/recovery/end?token=${token}`, loadData: { newPassword: newPass } })

            setIsLoad(false)

            navigate('/')
        } catch (e: any) {
            setIsLoad(false)
            const response = e.response
            errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
        }
    }

    return (
        <div className='confirm-body'>
            <div className='confirm-container' style={{ height: '250px' }}>
                <h2>Восстановление пароля</h2>

                <div className='signin-input-container'>
                    <h3>Пароль</h3>
                    <input type={isPassShow ? 'text' : 'password'} autoComplete='new-password' placeholder='Пароль' value={newPass} onChange={(e) => setNewPass(e.target.value)}/>
                    <button className='signin-but-showPass' onClick={() => setIsPassShow(!isPassShow)}>{ isPassShow ? 'Скрыть пароль' : 'Показать пароль' }</button>
                </div>

                <div className='signin-bottom-container' style={{ marginTop: '30px', justifyContent: 'end' }}>
                    { isLoad ? <Loader /> : null }
                    <button style={{ display: !isLoad ? 'block' : 'none', height: '40px' }} className='signin-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
};