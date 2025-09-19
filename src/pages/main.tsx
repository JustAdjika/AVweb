import { useEffect, useState } from 'react'
import axios from 'axios'

import { useInView } from 'react-intersection-observer';
import { Slider } from '../components/slider';
import PhoneInput from '../components/phoneInput';
import { Footer } from '../components/footer';
import { Config } from '../../config';

import * as Types from '../../module/types/types.ts'

import './style/main.css'
import 'cleave.js/dist/addons/cleave-phone.ru';


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

const SlideComponent = (props: PropsSlide) => {
    return (
        <div className='slide-container' style={{ backgroundImage: `url('${ props.info.img }')` }}>
            <div className='slide-decorative-line' />
            <h2 className='slide-title'>{ props.info.title }</h2>
            <span className='slide-date'>{ props.info.date }</span>
            <span className='slide-staffs'>Около { props.info.staffs } волонтёров</span>
            <div className='slide-decorative-line' />
        </div>
    )
}

export const Main = ({ setErrorMessage }: Props) => {
    const config = new Config()

    // UI

    const { ref: titleView, inView: isTitleView } = useInView({ threshold: 0.3 });

    const { ref: years1View, inView: isYears1View } = useInView({ threshold: 0.3 });
    const { ref: years2View, inView: isYears2View } = useInView({ threshold: 0.3 });
    const { ref: years3View, inView: isYears3View } = useInView({ threshold: 0.3 });

    const { ref: inviteView, inView: isInviteView } = useInView({ threshold: 0.3 })

    const [titleViewState, setTitleViewState] = useState<boolean>(false)
    const [years1viewState, setYears1viewState] = useState<boolean>(false)
    const [years2viewState, setYears2viewState] = useState<boolean>(false)
    const [years3viewState, setYears3viewState] = useState<boolean>(false)
    const [inviteViewState, setInviteViewState] = useState<boolean>(false)


    useEffect(() => {
        if(isTitleView) {
            setTitleViewState(true)
        }
    }, [isTitleView])

    useEffect(() => {
        if(isYears1View) {
            setYears1viewState(true)
        }
    }, [isYears1View])

    useEffect(() => {
        if(isYears2View) {
            setYears2viewState(true)
        }
    }, [isYears2View])
    
    useEffect(() => {
        if(isYears3View) {
            setYears3viewState(true)
        }
    }, [isYears3View])

    useEffect(() => {
        if(isInviteView) {
            setInviteViewState(true)
        }
    }, [isInviteView])

    interface slide {
        title: string,
        date: string,
        staffs: number,
        img: string
    }

    const slides2: slide[] = [
        {
            title: '50CENT',
            date: '28.11.23',
            staffs: 100,
            img: './src/assets/img/event_50cent.png'
        },
        {
            title: 'ДЖЕННИФЕР ЛОПЕС',
            date: '10.08.25',
            staffs: 100,
            img: './src/assets/img/event_jenifer.png'
        },
        {
            title: 'ЕГОР КРИД',
            date: '27.03.24',
            staffs: 100,
            img: './src/assets/img/event_krid.png'
        },
        {
            title: 'SCORPIONS',
            date: '28.05.24',
            staffs: 100,
            img: './src/assets/img/event_scorpions.png'
        },
        {
            title: 'MACAN',
            date: '28.11.24',
            staffs: 100,
            img: './src/assets/img/event_macan.png'
        },
        {
            title: 'AKON',
            date: '15.12.24',
            staffs: 100,
            img: './src/assets/img/event_akon.png'
        },
        {
            title: 'SADRADDIN',
            date: '15.09.24',
            staffs: 300,
            img: './src/assets/img/event_sadraddin.png'
        },
    ]




    // UX

    // Форматирование номера
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState("")

    const [isMessageSend, setIsMessageSend] = useState<boolean>(false)

    const sendMessage = async() => {
        if(phone.length < 18 || !email || !message) {
            const message = `Одно из полей не заполнено!` 
            console.error(message)
            setErrorMessage(message)
            setTimeout(() => setErrorMessage(null), 3000)

            console.log(phone.length, email, message)
            return  
        }

        try {
            const response = await axios.post(`${config.serverDomain}/api/developer/forms/email/org`, {
                email,
                contact: phone,
                text: message
            })

            const responseData: Types.Response = response.data

            if(responseData.status === 200) {
                setIsMessageSend(true)
                setTimeout(() => setIsMessageSend(false), 5000)
            } else {
                const message = `Ошибка ${responseData.status}: ${responseData.message}` 
                console.error(message)
                setErrorMessage(message)
                setTimeout(() => setErrorMessage(null), 3000)
            }
        } catch (e: any) { 
            console.error(e.message)
            setErrorMessage(e.message)
            setTimeout(() => setErrorMessage(null), 3000)
        }

    }


    return (
        <div className='main-body'>
            <div className='main-background-container'>
                <button className='main-background-invite-container' onClick={ () => window.location.href = '/#anchor_invite'  }>
                    <span className='main-background-invite-title'>Стать частью нашей <span style={{ color: '#D9910D' }}>Команды</span></span>
                    <div className='main-background-invite-decorative-line' />
                </button>
                <div className='main-banner-title-container'>
                    <h1>ALLIANCE OF</h1>
                    <div>
                        <h1>VOLUNTEERS</h1>
                        <div />
                    </div>
                </div>
            </div>
            <div className='main-title-container' ref={titleView} style={{ marginTop: '30px' }}>
                <h2 className={`main-title-text ${titleViewState ? 'view' : 'hidden'}`}>мечтай, твори и действуй вместе с alliance!</h2>
                <div className='main-title-decorative-item swim1' style={{ backgroundImage: `url('/src/assets/img/deco_item1.png')`, left: '20px', top: '25px' }}/>
                <div className='main-title-decorative-item swim2' style={{ backgroundImage: `url('/src/assets/img/deco_item2.png')`, top: '0px', width: '70px', height: '70px' }}/>
                <div className='main-title-decorative-item swim3' style={{ backgroundImage: `url('/src/assets/img/deco_item3.png')`, right: '35px' }}/>
            </div>
            <div className='main-cities-container' style={{ marginTop: '30px' }}>
                <div className='main-cities-icon almaty'/>
                <div className='main-cities-title-wrapper'>
                    <h2 className='main-cities-title-text'>Два филиала в крупнейших городах Казахстана</h2>
                    <button className='main-cities-invite' onClick={ () => window.location.href = '/#anchor_invite' }>Вступить в организацию</button>
                </div>
                <div className='main-cities-icon astana'/>
            </div>
            <div className='main-years-container' style={{ marginTop: '120px', position: 'relative' }}>
                <div className={`main-years-left-wrapper`}>
                    <h2 ref={years1View} className={`main-years-title up ${ years1viewState ? 'open' : 'closed' }`}>6 лет</h2>
                    <h2 ref={years2View} className={`main-years-title center ${ years2viewState ? 'open' : 'closed' }`}>делаем</h2>
                    <h2 ref={years3View} className={`main-years-title down ${ years3viewState ? 'open' : 'closed' }`}>добро</h2>
                </div>
                <div className='main-years-image' />
            </div>
            <div className='main-about-container' style={{ position: 'relative', top: '150px', display: 'flex', flexDirection: 'column' }}>
                <p style={{ paddingLeft: '55px', paddingRight: '30px' }}><span style={{ color: '#D9910D', fontFamily: 'Bebas_bold', fontSize: '25pt' }}>МЫ</span> сообщество <span>активных и ответственных людей</span>, которые обеспечивают <span>атмосферу</span> и <span>порядок</span> на крупнейших мероприятиях города. Мы работаем на профессиональном уровне: от отбора и подготовки волонтёров до <span>слаженной координации команд</span> на месте. Наши проекты охватывают спорт, культуру, благотворительность и городские фестивали, где мы всегда остаёмся <span>надёжным</span> партнёром для организаторов</p>
                <span style={{ fontFamily: 'OpenSans_Light', textAlign: 'right', paddingRight: '20px' }}>Узнать <a href="#" style={{ color: '#077471', fontFamily: 'Bebas_Bold' }}>О НАС</a> больше</span>
                <div className='main-about-decorative-item swim1' style={{ backgroundImage: `url('/src/assets/img/deco_item4.png')` }}/>
                <div className='main-about-decorative-item swim2' style={{ backgroundImage: `url('/src/assets/img/deco_item5.png')`, left: '180px', top: '-60px' }}/>
                <div className='main-about-decorative-item swim3' style={{ backgroundImage: `url('/src/assets/img/deco_item6.png')`, left: '150px', top: '170px' }}/>
            </div>
            <div className='main-projects-container'>
                <div className='main-projects-title-container' style={{ marginBottom: '30px' }}>
                    <div className='main-projects-title-decorative-line'/>
                    <h2 className='main-projects-title-text'>Наши крупнейшие проекты</h2>
                    <div className='main-projects-title-decorative-line'/>
                </div>
                <Slider
                    slides={slides2.map((item) => (
                        <SlideComponent info={item} />
                    ))}
                />
                <div className='main-projects-title-decorative-line' style={{ margin: '0px', bottom: '50px', position: 'relative' }} />
            </div>
            <div className='main-invite-info-container'>
                <div className='main-invite-info-title' ref={inviteView}>
                    <span className={`main-invite-info-span bold ${ inviteViewState ? 'view' : '' }`}>ВСТУПАЙТЕ</span>
                    <span className={`main-invite-info-span thin ${ inviteViewState ? 'view' : '' }`} style={{ transitionDelay: '0.3s' }}>В НАШУ</span>
                    <span className={`main-invite-info-span bold ${ inviteViewState ? 'view' : '' }`} style={{ transitionDelay: '0.7s' }}>КОМАНДУ</span>
                </div>
                <div className='main-invite-info-wrapper' id='anchor_invite'>
                    <button className='main-invite-info-but' onClick={() => window.location.href = 'https://www.youtube.com' } >Вступить в организацию</button>
                    <div className='main-invite-info-text-container'>
                        <p>При нажатии вы получите приглашение в группу для прохождения собеседования. Вся информация будет передана HR менеджерам. Для подачи заявления требуется возраст от 16 лет</p>
                    </div>
                </div>
            </div>
            <div className='main-org-container'>
                <h2 style={{ fontFamily: 'OpenSans_light', fontWeight: 'lighter', fontSize: '15pt', textAlign: 'left', position: 'relative', right: '25px' }}>Заявление для организаторов</h2>
                <div className='main-org-mail-container' style={{ marginBottom: !isMessageSend ? '150px' : '0px' }}>
                    <h3>Почта для обратной связи</h3>
                    <div>
                        <input type="text" placeholder='example@gmail.com' autoComplete='email' onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <h3>Номер телефона</h3>
                    <div>
                        <PhoneInput value={phone} changeValue={setPhone} />
                    </div>
                    <textarea name="" placeholder='Ваше сообщение' id="" onChange={(e) => setMessage(e.target.value)}></textarea>
                    <button onClick={sendMessage}>Отправить</button>
                </div>
                <p style={{ display: isMessageSend ? 'flex' : 'none', marginBottom: '150px', width: '100%', marginLeft: '100px', fontFamily: 'OpenSans_light' }}>Сообщение отправлено</p>
            </div>
            <Footer />
        </div>
    );
};