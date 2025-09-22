import { Account } from "../components/class/accountClass";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { ReactComponent as InfoIcon } from '../assets/icons/circle-info-solid-full.svg'
import { ReactComponent as PenIcon } from '../assets/icons/pen-solid-full.svg'
import { ReactComponent as KeyIcon } from '../assets/icons/key-solid-full.svg'
import { ReactComponent as ImportIcon } from '../assets/icons/file-import-solid-full.svg'
import { ReactComponent as ShirtIcon } from '../assets/icons/shirt-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../assets/icons/qrcode-solid-full.svg'

import { Footer } from "../components/footer";
import PhoneInput from "../components/phoneInput";
import Loader from "../components/loader.tsx";
import { Config } from "../../config.ts";

import * as Types from '../../module/types/types.ts'

import './style/profile.css'

type Props = {
    setErrorMessage: (message: string | null) => void
}

export const Profile = ({ setErrorMessage }: Props) => {
    const config = new Config()

    // UI

    const [personalInfoNote, setPersonalInfoNote] = useState<boolean>(false)
    const [edit, setEdit] = useState<boolean>(false)
    const [editPass, setEditPass] = useState<boolean>(false)

    const [emailLoader, setEmailLoader] = useState<boolean>(false)
    const [passwordLoader, setPasswordLoader] = useState<boolean>(false)
    const [qrLoader, setQrLoader] = useState<boolean>(true)

    const [passwordChanged, setPasswordChanged] = useState<boolean>(false)

    const [qrModal, setQrModal] = useState<boolean>(false)
    const [qrType, setQrType] = useState<'getEquip' | 'returnEquip' | 'personal'>('personal')


    // UX

    const [accountClass, setAccountClass] = useState<Account | null>(null)

    const [personalInfo, setPersonalInfo] = useState<Types.Account | null>(null)

    const [newPass, setNewPass] = useState<string>("")
    const [newEmail, setNewEmail] = useState<string>("")

    const [contactWhatsapp, setContactWhatsapp] = useState<string | null>(null)
    const [contactKaspi, setContactKaspi] = useState<string | null>(null)

    const [currentWhatsapp, setCurrentWhatsapp] = useState<string | null>(null)
    const [currentKaspi, setCurrentKaspi] = useState<string | null>(null)

    const [code, setCode] = useState<string>("")
    const [confirmToken, setConfirmToken] = useState<string | null>(null)

    const [codeField, setCodeField] = useState<boolean>(false)

    const [password, setPassword] = useState<string | null>(null)

    const [idCardStatus, setIdCardStatus] = useState<Types.idCardConfirm | null>(null)
    
    
    const handleNewPassConfirm = async() => {
        if(newPass.length < 8) {
            setErrorMessage('Пароль должен состоять из минимум 8 символов')
            setTimeout(() => setErrorMessage(null), 3000)
            return
        }

        try { 
            setPasswordLoader(true)
            const res = await accountClass?.changePassword({ oldPassword: password || "", newPassword: newPass })

            if(res?.status === 200) {
                setEditPass(false)
                setPasswordChanged(true)
                setPasswordLoader(false)
                setTimeout(() => setPasswordChanged(false), 3000)
            }
        } catch (err: any) {
            setPasswordLoader(false)
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
        setPassword("")
        setNewPass("")
    }
    
    const handleSendCode = async () => {
        try { 
            setEmailLoader(true)
            const res = await accountClass?.updateEmailgetToken(newEmail)
            if(res?.status === 200) {
                const container = res.container as { confirmToken: string }
                setCodeField(true)
                setConfirmToken(container.confirmToken)
            }
            setEmailLoader(false)
        } catch (err: any) {
            setEmailLoader(false)
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
    }

    const handleCodeChange = async(e:any) => {
        if(e.target.value.length === 6) {
            setCode(e.target.value.toUpperCase())
            setCodeField(false)

            setEmailLoader(true)

            console.log(confirmToken)

            if(!confirmToken) return setCode("")
            try {
                console.log(code)
                const res = await accountClass?.updateEmailconfirm({ code: e.target.value.toUpperCase(), token: confirmToken }) 

                if(res?.status === 200) {
                    setEmailLoader(false)
                    setPersonalInfo(prev => ({
                        ...prev,
                        email: newEmail
                    } as Types.Account))
                    setEdit(false)
                } else {
                    console.log(res)
                }
            } catch (err:any) {
                setEmailLoader(false)
                const data = err?.response?.data
                if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
                else setErrorMessage(err.message)
            }
            setCode("")
        } else {
            setCode(e.target.value.toUpperCase())
        }
    }

    const handleNewContactConfirm = async() => {
        try {
            accountClass?.updateContactInfo({ contactWhatsapp, contactKaspi })

            setEdit(false)
            setCurrentKaspi(contactKaspi)
            setCurrentWhatsapp(contactWhatsapp)
        } catch (err: any) {
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
    }

    const handleLoadIdCard = async(e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0]

            if(!file) return

            const res = await accountClass?.uploadIdCard(file)

            if(res?.status === 200) {
                setIdCardStatus('AWAITING')
            }
        } catch (err: any) {
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
    }

    useEffect(() => {
        Account.create(setErrorMessage)
            .then(account => {
                if(account) {
                    const data = account.data as Types.Account

                    setAccountClass(account)

                    setPersonalInfo(data)
                    
                    setCurrentWhatsapp(data.contactWhatsapp)
                    setCurrentKaspi(data.contactKaspi)

                    setContactWhatsapp(data.contactWhatsapp)
                    setContactKaspi(data.contactKaspi)

                    setIdCardStatus(data.idCardConfirm)
                }
            })
            .catch(err => {
                setErrorMessage(err.message)
                setTimeout(() => setErrorMessage(null), 3000)
            })
    }, [])


    const [getEquipQR, setGetEquipQR] = useState<string | null>(null)
    const [retunEquipQR, setReturnEquipQR] = useState<string | null>(null)

    const handlePersonalQR = () => {
        setQrModal(true)
        setQrType('personal')
    }

    const handleGetEquipQR = async() => {
        setQrLoader(true)
        setQrModal(true)
        setQrType('getEquip')

        try {
            const res = await accountClass?.getEquip()

            if(res?.status === 200) {
                const container = res.container as { qrId: string }
                setGetEquipQR(container.qrId)
            }
            setQrLoader(false)
        } catch (err: any) {
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
    }

    const handleReturnEquipQR = async() => {
        setQrLoader(true)
        setQrModal(true)
        setQrType('returnEquip')

        try {
            const res = await accountClass?.returnEquip()

            if(res?.status === 200) {
                const container = res.container as { qrId: string }
                setReturnEquipQR(container.qrId)
            }
            setQrLoader(false)
        } catch (err: any) {
            const data = err?.response?.data
            if(data) { setErrorMessage(data?.message); setTimeout(() => setErrorMessage(null), 3000) }
            else setErrorMessage(err.message)
        }
    }

    const roleStyles = {
        admin: {
            display: 'flex',
            borderColor: '#A44806',
            color: '#A44806'
        },
        crd: {
            display: 'flex',
            borderColor: '#2F0774',
            color: '#2F0774'
        },
        vol: {
            display: 'flex',
            borderColor: '#077471',
            color: '#077471'
        },
        user: {
            display: 'none'
        }
    }


    return (
        <>
            <div className="profile-qrmodal-wrapper" style={{ display: qrModal ? 'flex' : 'none' }} onClick={() => setQrModal(false)}>
                <div className="profile-qrmodal-container" onClick={(e) => e.stopPropagation()}>
                    { qrType === 'personal' ? (<>
                        <h2>Личный QR Профиля</h2>
                        <Loader style={{ marginTop: '170px', display: qrLoader ? 'flex' : 'none' }}/>
                        <img 
                            className='profile-qrmodal-img' 
                            onLoad={() => setQrLoader(false)}
                            src={`${config.serverDomain}/uploads/qr/${qrType}/${accountClass?.data.personalQrId}`} 
                            style={{ display: !qrLoader ? 'block' : 'none' }}
                        />
                    </>) : qrType === 'getEquip' ? (<>
                        <h2>QR получения экипировки</h2>
                        <Loader style={{ marginTop: '170px', display: qrLoader ? 'flex' : 'none' }}/>
                        <img 
                            className='profile-qrmodal-img' 
                            onLoad={() => setQrLoader(false)}
                            src={`${config.serverDomain}/uploads/qr/${qrType}/${getEquipQR}`} 
                            style={{ display: !qrLoader ? 'block' : 'none' }}
                        />
                    </>) : qrType === 'returnEquip' ? (<>
                            <h2>QR возврата экипировки</h2>
                            <Loader style={{ marginTop: '170px', display: qrLoader ? 'flex' : 'none' }}/>
                            <img 
                                className='profile-qrmodal-img' 
                                onLoad={() => setQrLoader(false)}
                                src={`${config.serverDomain}/uploads/qr/${qrType}/${retunEquipQR}`} 
                                style={{ display: !qrLoader ? 'block' : 'none' }}
                            />
                    </>) : null }
                </div>
            </div>
            <div className="profile-body">

                <div className="profile-header-container">
                    <h1>Кабинет пользователя</h1>
                    <div className="profile-role"
                        style={
                            accountClass?.data.role === 'ADMIN' ? roleStyles.admin
                            : accountClass?.data.role === 'COORDINATOR' ? roleStyles.crd 
                            : accountClass?.data.role === 'VOLUNTEER' ? roleStyles.vol
                            : roleStyles.user
                        }
                    ><span>{
                        accountClass?.data.role === 'ADMIN' ? 'Администратор'
                        : accountClass?.data.role === 'COORDINATOR' ? 'Координатор' 
                        : accountClass?.data.role === 'VOLUNTEER' ? 'AV_Волонтер'
                        : null
                    }</span></div>
                </div>

                <div className="profile-pesonalinfo-wrapper">
                    <div className="profile-personalinfo-header">
                        <h2>Личная информация</h2>
                        <InfoIcon 
                            fill={ !personalInfoNote ? '#55868C' : '#3a5c61ff'} 
                            width={30} 
                            height={30} 
                            style={{ 
                                transition: '0.3s ease-in-out', 
                                width: '30px', 
                                height: '30px', 
                                position: 'relative', 
                                top: '1px'
                            }} 
                            onMouseEnter={() => setPersonalInfoNote(true)} 
                            onMouseLeave={() => setPersonalInfoNote(false)} 
                        />
                        <div className={`profile-personalinfo-note ${personalInfoNote ? 'visible' : ''}`}>
                            <span>Для изменения личной информации, обратитесь в <a href="https://www.youtube.com/" style={{ color: '#066DA7', pointerEvents: !personalInfoNote ? 'none' : 'auto' }}>тех поддержку</a></span>
                        </div>
                    </div>
                    <div className="profile-personalinfo-container">
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">ФИО:</span>
                            <span className="profile-personalinfo-option-value">{personalInfo?.name}</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">Дата рождения:</span>
                            <span className="profile-personalinfo-option-value">{personalInfo?.birthday}</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">ИИН:</span>
                            <span className="profile-personalinfo-option-value">{personalInfo?.iin}</span>
                        </div>
                        <div className="profile-personalinfo-option-container">
                            <span className="profile-personalinfo-option-title">Регион:</span>
                            <span className="profile-personalinfo-option-value">{personalInfo?.region === 'almaty' ? 'Алматы' : 'Астана'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-contactinfo-wrapper">
                    <h2>Контактная информация</h2>
                    <div className="profile-contactinfo-container">
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Почта:</span>
                            { emailLoader ? (
                                <Loader />
                            ) : null }
                            { !edit && !emailLoader  ? (
                                <span className="profile-contactinfo-option-value">{personalInfo?.email}</span>
                            ) : null }
                            { edit && !emailLoader ? (
                                <>
                                    <input 
                                        type="text" 
                                        className="profile-newcontact-input" 
                                        placeholder="Новая почта" 
                                        value={newEmail} 
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        autoComplete="email"
                                    />

                                    <input 
                                        maxLength={6}
                                        type="text" 
                                        className="profile-newcontact-input" 
                                        placeholder="XXXXXX" 
                                        value={code} 
                                        style={{
                                            display: codeField ? 'flex' : 'none',
                                            width: '60px',
                                            marginTop: '10px',
                                            paddingLeft: '7px'
                                        }}
                                        onChange={handleCodeChange}
                                        autoComplete="off"
                                    />

                                    <button 
                                        style={{ display: codeField ? 'none' : 'flex' }} 
                                        className="profile-newcontact-but" 
                                        onClick={handleSendCode}
                                    >
                                        Отправить код
                                    </button>
                                </>
                            ) : null }
                        </div>
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Телефон (Whatsapp):</span>
                            { !edit ?
                                <span className="profile-contactinfo-option-value">{currentWhatsapp ? currentWhatsapp : 'Не привязан'}</span>
                            : (
                                <PhoneInput 
                                    value={contactWhatsapp} 
                                    changeValue={setContactWhatsapp} 
                                    className="profile-newcontact-input" 
                                    autoComplete="off"
                                />
                            ) }
                        </div>
                        <div className="profile-contactinfo-option-container">
                            <span className="profile-contactinfo-option-title">Телефон (Kaspi):</span>
                            { !edit ?
                                <span className="profile-contactinfo-option-value">{currentKaspi ? currentKaspi : 'Не привязан'}</span>
                            : (
                                <PhoneInput 
                                    value={contactKaspi} 
                                    changeValue={setContactKaspi} 
                                    className="profile-newcontact-input" 
                                    autoComplete="off"
                                />
                            ) }
                        </div>
                    </div>
                    <div className="profile-contactinfo-footer">

                        {/* Новый пароль */}
                        <div style={{ display: editPass ? 'flex' : 'none', flexDirection: 'column', width: '100%' }}>
                            { passwordLoader ? <Loader /> : null }
                            { !passwordLoader ? (<>
                            <input 
                                type="password" 
                                style={{ display: editPass ? 'block' : 'none' }} 
                                className="profile-passedit-input" 
                                placeholder="Старый пароль" 
                                value={password || ""}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <NavLink
                                to="/auth/recovery"
                                className="profile-passedit-but" 
                                onClick={() => { setEditPass(false); setNewPass("") }} 
                                style={{ width: '150px', margin: '0px', marginBottom: '10px', textAlign: 'left' }}
                            >Забыл пароль</NavLink>
                            <input 
                                type="password" 
                                style={{ display: editPass ? 'block' : 'none' }} 
                                className="profile-passedit-input" 
                                placeholder="Новый пароль" 
                                value={newPass} 
                                onChange={(e) => setNewPass(e.target.value)}
                                autoComplete="new-password"
                            />
                            <div style={{ display: 'flex' }}>
                                <button className="profile-passedit-but" onClick={handleNewPassConfirm}>Подтвердить</button>
                                <button className="profile-passedit-but" onClick={() => { setEditPass(false); setNewPass(""); setPassword("") }}>Отменить</button>
                            </div>
                            </>) : null}
                        </div>

                        {/* Контактная изменить */}
                        <div style={{ display: edit ? 'flex' : 'none' }}>
                            <button className="profile-passedit-but" onClick={handleNewContactConfirm}>Подтвердить</button>
                            <button className="profile-passedit-but" onClick={() => { setEdit(false); setContactKaspi(currentKaspi); setContactWhatsapp(currentWhatsapp); setNewEmail(""); setConfirmToken(null), setCode("") }}>Отменить</button>
                        </div>

                        {/* Дефолтная изменить */}
                        <button className={`profile-contactinfo-edit ${!edit && !editPass ? '' : 'hidden'}`} onClick={() => setEdit(true)}>
                            <PenIcon fill='#1a1a1a' width={30} height={30} style={{ width: '20px', height: '20px', position: 'relative', top: '1px'}} />
                            <span>Изменить</span>
                        </button>
                        <button className={`profile-contactinfo-edit ${!edit && !editPass ? '' : 'hidden'}`}  onClick={() => setEditPass(true)}>
                            <KeyIcon fill='#1a1a1a' width={30} height={30} style={{ width: '20px', height: '20px', position: 'relative', top: '1px'}} />
                            <span>Изменить пароль</span>
                        </button>

                    </div>
                    <span 
                        style={{ 
                            fontFamily: 'OpenSans_light', 
                            marginLeft: '10px', 
                            marginTop: '5px', 
                            color: '#077471', 
                            display: passwordChanged ? 'flex' : 'none'
                        }}
                    >
                        Пароль успешно изменен!
                    </span>
                </div>

                <div className="profile-personconfirm-container">
                    <h2>Подтверждение личности</h2>
                    <p>Наша организация требует удостоверение личности, для подтверждения указанных данных. Поэтому для участия в любых мероприятиях, вам нужно отправить фотографию лицевой стороны удостверения личности (Сторона с вашей фотографией, именем, ИИН и датой рождения). Через время администрация проверит его и выдаст подтверждение </p>
                    <div className="profile-personconfirm-status-container">
                        <span className="profile-personconfirm-status-title">Статус:</span>
                        <span className="profile-personconfirm-status-value"
                            style={{ 
                                color: idCardStatus === 'UNCERTAIN' ? 
                                    '#840C00'
                                : idCardStatus === 'AWAITING' ?
                                    '#937F10'
                                : idCardStatus === 'CONFIRM' ?
                                    '#0CA911'
                                : '#fff' 
                            }}>
                            { idCardStatus === 'UNCERTAIN' ? 
                                'Не подтвержден'
                            : idCardStatus === 'AWAITING' ?
                                'На проверке'
                            : idCardStatus === 'CONFIRM' ?
                                'Подтвержден'
                            : 'null'
                            }
                        </span>
                    </div>
                    <label htmlFor="profileIdCardInput" className="profile-personconfirm-input">
                        <ImportIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px'}}/>
                        <span>Выбрать файл</span>
                    </label>
                    <input style={{ display: 'none' }} type="file" id="profileIdCardInput" accept=".jpg,.png,.jpeg" onChange={handleLoadIdCard}/>
                </div>

                <div className="profile-qr-container">
                    <button onClick={handlePersonalQR}>
                        <QRcodeIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px'}}/>
                        QR код Профиля
                    </button>
                    <button onClick={handleGetEquipQR}>
                        <ShirtIcon fill='#1a1a1a' width={30} height={30} style={{ width: '30px', height: '30px', position: 'relative', top: '1px', marginRight: '5px'}} />
                        Получить экипировку
                    </button>
                    <button onClick={handleReturnEquipQR}>Сдать экипировку</button>
                </div>

            </div>
            <Footer />
        </>
    );
};