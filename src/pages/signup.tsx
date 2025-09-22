import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';

import { errorLogger } from '../errorLogger.ts';
import { request } from '../serverRequest.ts';
import Loader from "../components/loader.tsx"

import * as Types from '../../module/types/types.ts'

import './style/auth.css'



type Props = {
    setErrorMessage: (message: string | null) => void
}


export const Signup = ({ setErrorMessage }: Props) => {
    const navigate = useNavigate()

    // UI

    const [isPassShow, setIsPassShow] = useState(false)

    const [day, setDay] = useState<string | number>("")
    const [month, setMonth] = useState<string | number>("")
    const [year, setYear] = useState<string | number>("")

    const dayRef = useRef<HTMLInputElement | null>(null)
    const monthRef = useRef<HTMLInputElement | null>(null)
    const yearRef = useRef<HTMLInputElement | null>(null)
    
    const [isLoad, setIsLoad] = useState<boolean>(false)

    const handleDayChange = (e: any) => {
        if (e.target.value === "") {
            setDay("");
            return;
        }

        const numberData = Number(e.target.value)
        if(!isNaN(numberData)) {
            if(numberData > 31) setDay('31')
            else setDay(e.target.value)
        }

        if(e.target.value.length === 2) monthRef.current?.focus()
    }

    const handleMonthChange = (e: any) => {
        if (e.target.value === "") {
            setMonth("");
            return;
        }

        const numberData = Number(e.target.value)
        if(!isNaN(numberData)) {
            if(numberData > 12) setMonth('12')
            else setMonth(e.target.value)
        }

        if(e.target.value.length === 2) yearRef.current?.focus()
    }

    const handleYearChange = (e: any) => {
        if (e.target.value === "") {
            setYear("");
            return;
        }

        const numberData = Number(e.target.value)
        if(!isNaN(numberData)) {
            setYear(e.target.value)
        }
    }


    // UX
    
    const [email, setEmail] = useState<string>("")
    const [pass, setPass] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [birthday, setBirthday] = useState<string>("")
    const [iin, setIin] = useState<string>("")
    const [region, setRegion] = useState<Types.region>("almaty")

    useEffect(() => {
        setBirthday(`${day}/${month}/${year}`)
    }, [day, month, year])

    const confirm = async () => {
        if(birthday.length < 8) return errorLogger(setErrorMessage, { status: 400, message: 'Дата рождения указана неверно' })
        if(pass.length < 8) return errorLogger(setErrorMessage, { status: 400, message: 'Длина пароля должна быть не менее 8 символов' })

        try {
            setIsLoad(true)
            const res = await request({ method: 'POST', route: '/account/register', loadData: { email, password: pass, name, birthday, region, iin } })

            const container = res.container as { confirmToken: string }

            setIsLoad(false)

            navigate(`/auth/confirm/${container.confirmToken}`)
        } catch (e: any) {
            setIsLoad(false)
            const response = e.response
            errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
        }
    }

    const handleIinChange = (e: any) => {
        if(e.target.value.length > 13) return
        if(isNaN(Number(e.target.value))) return

        setIin(e.target.value)
    }

    return (
        <div className='signup-body'>
            <div className='signup-container'>
                <h2>Регистрация</h2>

                <div className='signin-input-container'>
                    <h3>Почта</h3>
                    <input type="email" name='email' autoComplete='email' placeholder='example@gmail.com' value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className='signin-input-container'>
                    <h3>Пароль</h3>
                    <input type={isPassShow ? 'text' : 'password'} autoComplete='new-password' placeholder='Пароль' value={pass} onChange={(e) => setPass(e.target.value)}/>
                    <button className='signin-but-showPass' onClick={() => setIsPassShow(!isPassShow)}>{ isPassShow ? 'Скрыть пароль' : 'Показать пароль' }</button>
                </div>

                <div className='signin-input-container' style={{ marginTop: '20px' }}>
                    <h3>ФИО</h3>
                    <input type="text" onChange={(e:any) => setName(e.target.value)} name='name' autoComplete='name' placeholder='Фамилия Имя'/>
                </div>

                <div className='signup-inputdata-container'>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3>Дата рождения</h3>
                        <div className='signup-input-date-container'>
                            <input 
                                type="text" 
                                value={day} 
                                onChange={handleDayChange} 
                                placeholder='ДД' 
                                maxLength={2} 
                                ref={dayRef}
                                autoComplete='bday-day'
                            />
                            <span>/</span>
                            <input 
                                type="text" 
                                value={month} 
                                onChange={handleMonthChange} 
                                placeholder='ММ' 
                                maxLength={2} 
                                ref={monthRef}
                                autoComplete='bday-month'
                            />
                            <span>/</span>
                            <input 
                                type="text" 
                                value={year} 
                                onChange={handleYearChange} 
                                placeholder='ГГ' 
                                maxLength={2} 
                                ref={yearRef}
                                autoComplete='bday-year'
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3>Регион</h3>
                        <select onChange={(e: any) => setRegion(e.target.value)} className='singup-region-select' name="month" autoComplete="bday-month">
                            <option value="almaty">Алматы</option>
                            <option value="astana">Астана</option>
                        </select>
                    </div>

                </div>

                <div className='signin-input-container'>
                    <h3>ИИН</h3>
                    <input type='text' autoComplete='off' value={iin} maxLength={12} onChange={handleIinChange} placeholder='XXXXXXXXXXXX'/>
                </div>

                <p>Обязательно! Для участия в проектах указывайте реальные данные </p>

                <div className='signin-bottom-container'>
                    <span>Уже есть аккаунт?<NavLink to='/auth/signin' className='signin-bottom-but-createAccount'>Войти?</NavLink></span>
                    { isLoad ? <Loader /> : null }
                    <button style={{ display: !isLoad ? 'block' : 'none' }} className='signin-bottom-but-confirm' onClick={confirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
};