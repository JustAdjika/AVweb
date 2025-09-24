import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';

import { errorLogger } from '../module/errorLogger.ts';
import { request } from '../module/serverRequest.ts';
import Loader from "../components/loader.tsx"

import './style/auth.css'



type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Recovery = ({ setErrorMessage }: Props) => {
    // UI
    const [isLoad, setIsLoad] = useState<boolean>(false)
    const [isSend, setIsSend] = useState<boolean>(false)

    // UX
    const [email, setEmail] = useState<string>("")

    const confirm = async() => {
        try {
            setIsLoad(true)
            await request({ method: 'POST', route: `/account/password/recovery/sendlink`, loadData: { email } })

            setIsLoad(false)

            setIsSend(true)
        } catch (e: any) {
            setIsLoad(false)
            const response = e.response
            errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
        }
    }

    useEffect(() => {
        setIsSend(false)
    }, [email])

    return (
        <div className='confirm-body'>
            <div className='confirm-container'>
                <h2>Восстановление пароля</h2>

                <p>Мы отправим вам на почту ссылку, для восстановления пароля</p>

                <div className='signin-input-container'>
                    <h3>Почта</h3>
                    <input 
                        type="email" 
                        name='email' 
                        autoComplete='email' 
                        placeholder='example@gmail.com' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className='signin-bottom-container' style={{ marginTop: '30px' }}>
                    <NavLink to='/auth/signin' className='confirm-bottom-escape'>Вернуться назад</NavLink>
                    { isLoad ? <Loader /> : null }
                    <p style={{ margin: '0px', position: 'relative', bottom: '7px', display: isSend ? 'inline' : 'none' }}>Ссылка отправлена!</p>
                    <button style={{ display: !isLoad && !isSend ? 'block' : 'none', height: '40px' }} className='signin-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
};