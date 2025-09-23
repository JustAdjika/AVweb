import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

import { ReactComponent as ArrowIcon } from '../assets/icons/chevron-down-solid-full.svg'
import { ReactComponent as PenIcon } from '../assets/icons/pen-solid-full.svg'
import { ReactComponent as PlusIcon } from '../assets/icons/plus-solid-full.svg'
import { ReactComponent as CheckIcon } from '../assets/icons/check-solid-full.svg'

import * as Types from '../../module/types/types.ts'

import './style/eventMain.css'

export const Event = ({ setErrorMessage }: { setErrorMessage: (message: string | null) => void }) => {

    // UI



    // Анимация заголовка при появлении в обзоре
    const { ref: titleView, inView: isTitleView } = useInView({ threshold: 0.3 });

    const [titleViewState, setTitleViewState] = useState<boolean>(false)

    useEffect(() => {
        if(isTitleView) {
            setTitleViewState(true)
        }
    }, [isTitleView])




    // Объявление состояний разделов
    const [dressCodeShow, setDressCodeShow] = useState<boolean>(() => {
        const showOptions = localStorage.getItem("showOptions")
        if(!showOptions) {
            return false
        } else {
            const parsedOptions = JSON.parse(showOptions)

            return parsedOptions.dressCodeShow
        }
    })

    const [behaviorShow, setBehaviorShow] = useState<boolean>(() => {
        const showOptions = localStorage.getItem("showOptions")
        if(!showOptions) {
            return false
        } else {
            const parsedOptions = JSON.parse(showOptions)

            return parsedOptions.behaviorShow
        }
    })

    const [rulesShow, setRulesShow] = useState<boolean>(() => {
        const showOptions = localStorage.getItem("showOptions")
        if(!showOptions) {
            return false
        } else {
            const parsedOptions = JSON.parse(showOptions)

            return parsedOptions.rulesShow
        }
    })




    // Состояния CMS окон

    const [dresscodeAcceptCMS, setDresscodeAcceptCMS] = useState<boolean>(false)
    const [dresscodeDenyCMS, setDresscodeDenyCMS] = useState<boolean>(false)

    const [behaviorCMS, setBehaviorCMS] = useState<boolean>(false)
    
    const [rulesCMS, setRulesCMS] = useState<boolean>(false)


    // Состояние показа ошибок
    const [behaviorCancelWindow, setBehaviorCancelWindow] = useState<boolean>(false) // Состояние окна
    const [behaviorSaveDenied, setBehaviorSaveDenied] = useState<boolean>(true) // Состояние самой ошибки

    const [dresscodeCancelWindow, setDresscodeCancelWindow] = useState<boolean>(false)
    const [dresscodeSaveDenied, setDresscodeSaveDenied] = useState<boolean>(false)

    const [rulesCancelWindow, setRulesCancelWindow] = useState<boolean>(false)
    const [rulesSaveDenied, setRulesSaveDenied] = useState<boolean>(false)





    // Получение конфига из localStorage об параметрах скрытых разделов информации
    useEffect(() => {
        const showOptions = {
            dressCodeShow,
            behaviorShow,
            rulesShow
        }

        const jsonOptions = JSON.stringify(showOptions)

        localStorage.setItem("showOptions", jsonOptions)
    }, [dressCodeShow, behaviorShow, rulesShow])




    // UX


    // Банк данных
    const testDresscode = {
        accept: [
            "Деловой костюм",
            "Шорты Спанч Боба",
            "Шорты Патрика"
        ],
        deny: [
            "АТ4 Мистера Крабса",
            "Флейта Сквидварда",
            "A-10 Гэрри"
        ]
    }

    const testBehaviors = [
        ["Я лох", "Ты лох", "Мы лох"],
        ["5 лишних хромосом", "7 лишних хромосом", "8 лишних хромосом"],
        ["Пока", "Привет", "Иди нахуй"],
    ]

    const testRules = [
        ["Я лох", "Ты лох", "Мы лох"],
        ["5 лишних хромосом", "7 лишних хромосом", "8 лишних хромосом"],
        ["Пока", "Привет", "Иди нахуй"],
    ]




    // Дресс код функции
    const handleDresscodeAcceptEdit = () => {
        
    }

    const handleDresscodeDenyEdit = () => {

    }






    // Правила поведения функции
    const handleBehaviorEdit = () => {

    }

    const handleBehaviorSave = () => {

    }


    return (
        <div className='event-body'>

            <div className='event-header-container'>
                <h1 ref={titleView}>
                    <span className={`event-header-span-stroke ${titleViewState ? 'inView' : 'hidden'}`}>ATP250</span>
                    <span className={`event-header-span-classic ${titleViewState ? 'inView' : 'hidden'}`}>ALMATY OPEN</span>
                </h1>
                <div className='event-header-logo-container'>
                    <div className='event-header-almatyopen-img' />
                    <div className='event-header-atp250-img' />
                </div>
            </div>
            <p className='event-info-p'>
                международный теннисный турнир серии ATP, который собирает сильных игроков со всего мира. Для волонтёров это шанс стать частью крупного спортивного события: помогать в организации матчей, работать с участниками и зрителями, получить уникальный опыт на мировой арене спорта
            </p>
            
            <div className='event-decorative-line'>Подробная информация мероприятия</div>
            
            <div className='event-dresscode-wrapper'>
                <div className='event-dresscode-header' onClick={() => setDressCodeShow(!dressCodeShow)}>
                    <h2>Дресс код</h2>
                    <ArrowIcon className={`event-header-arrow ${ dressCodeShow ? 'view' : 'hidden' }`}/>
                </div>
                <div className='event-dresscode-container' style={{ display: dressCodeShow ? 'block' : 'none' }}>
                    <div>
                        <div>
                            { !dresscodeAcceptCMS ?
                                <PenIcon className='event-dresscode-editicon' onClick={handleDresscodeAcceptEdit}/>
                            :
                                <CheckIcon className='event-dresscode-editicon' fill='#30762D'/>
                            }
                            <h3>Разрешено</h3>
                        </div>
                        <button className='event-dresscode-cancel' style={{ display: dresscodeAcceptCMS ? 'block' : 'none' }}>Отменить</button>
                    </div>
                    { !dresscodeAcceptCMS ? (
                        <ul>
                            { testDresscode.accept.map(item => ( <li>{item}</li> )) }
                        </ul>
                    ) : (
                        <div className='event-dresscode-cms-container'>
                            { testDresscode.accept.map(_ => (
                                <div className='event-dresscode-cms-item-container'>
                                    <button />
                                    <input type="text" />
                                </div>
                            )) }
                            <button className='event-dresscode-cms-add'>
                                <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                Добавить пункт
                            </button>
                        </div>
                    ) }
                    <div>
                        <div>
                            { !dresscodeDenyCMS ? 
                                <PenIcon className='event-dresscode-editicon' onClick={handleDresscodeDenyEdit}/>
                            :
                                <CheckIcon className='event-dresscode-editicon' fill='#30762D'/>
                            }
                            <h3 style={{ color: '#C0392B' }}>Запрещено</h3>
                        </div>
                        <button className='event-dresscode-cancel' style={{ display: dresscodeDenyCMS ? 'block' : 'none' }}>Отменить</button>
                    </div>
                    { !dresscodeDenyCMS ? (
                        <ul>
                            { testDresscode.deny.map(item => ( <li>{item}</li> )) }
                        </ul>
                    ) : (
                        <div className='event-dresscode-cms-container'>
                            { testDresscode.deny.map(_ => (
                                <div className='event-dresscode-cms-item-container'>
                                    <button />
                                    <input type="text" />
                                </div>
                            )) }
                            <button className='event-dresscode-cms-add'>
                                <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                Добавить пункт
                            </button>
                        </div>
                    ) }
                </div>
            </div>




            <div className='event-behavior-wrapper' style={{ display: testBehaviors.length !== 0 ? 'flex' : 'none' }}>
                <div className='event-behavior-header' onClick={() => setBehaviorShow(!behaviorShow)}>
                    <h2>Правила поведения</h2>
                    <ArrowIcon className={`event-header-arrow ${ behaviorShow ? 'view' : 'hidden' }`}/>
                </div>
                <div className='event-behavior-container' style={{ display: behaviorShow ? 'block' : 'none', paddingBottom: behaviorCMS ? '20px' : '0px' }}>
                    <PenIcon className='event-behavior-editicon' onClick={handleBehaviorEdit} style={{ display: !behaviorCMS ? 'flex' : 'none' }}/>
                    { 
                        testBehaviors.map((_, optionIndex) => (
                            <div className='event-behavior-option-container'>
                                <h3>{`Раздел ${optionIndex+1}`}</h3>
                                <ul style={{ paddingLeft: behaviorCMS ? '10px' : '40px' }}>
                                    { testBehaviors[optionIndex].map(item => (
                                        behaviorCMS ? (
                                            <div className='event-behavior-cms-item-container'>
                                                <button />
                                                <input type="text" />
                                            </div>
                                        ) : (
                                            <li>{item}</li>
                                        )
                                    )) }
                                </ul>
                                <button className='event-dresscode-cms-add' style={{ width: '150px', marginBottom: '30px', display: behaviorCMS ? 'flex' : 'none' }}>
                                    <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                    Добавить пункт
                                </button>
                            </div>
                        ))
                    }
                    <button className='event-dresscode-cms-add' style={{ marginLeft: '15px', marginTop: '30px', width: '160px', display: behaviorCMS ? 'flex' : 'none' }}>
                        <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                        Добавить раздел
                    </button>
                    <div style={{ 
                        position: 'relative', 
                        flex : 'none', 
                        flexDirection: 'column', 
                        marginLeft: '15px', 
                        alignItems: 'center',
                        display: behaviorCMS ? 'flex' : 'none'
                    }}>
                        <div className={`event-behavior-alert-cantsave ${behaviorCancelWindow ? 'visible' : ''}`}>Вы не можете сохранить, пока не заполните все поля!</div>
                        <button 
                            className={`event-behavior-savebut ${behaviorSaveDenied ? 'denied' : ''}`} 
                            onClick={behaviorSaveDenied ? 
                                () => { 
                                    setBehaviorCancelWindow(true), 
                                    setTimeout(() => setBehaviorCancelWindow(false), 3000) 
                                } : handleBehaviorSave
                            }
                        >Сохранить</button>
                        <button className='event-behavior-savebut cancel'>Отменить изменения</button>
                    </div>
                </div>
            </div>




            <div className='event-behavior-wrapper' style={{ display: testRules.length !== 0 ? 'flex' : 'none' }}>
                <div className='event-behavior-header' onClick={() => setRulesShow(!rulesShow)}>
                    <h2 style={{ fontSize: '16pt' }}>Правила мероприятия</h2>
                    <ArrowIcon className={`event-header-arrow ${ rulesShow ? 'view' : 'hidden' }`}/>
                </div>
                <div className='event-behavior-container' style={{ display: rulesShow ? 'block' : 'none', paddingBottom: rulesCMS ? '20px' : '0px' }}>
                    <PenIcon className='event-behavior-editicon' onClick={handleBehaviorEdit} style={{ display: !rulesCMS ? 'flex' : 'none' }}/>
                    { 
                        testRules.map((_, optionIndex) => (
                            <div className='event-behavior-option-container'>
                                <h3>{`Раздел ${optionIndex+1}`}</h3>
                                <ul style={{ paddingLeft: rulesCMS ? '10px' : '40px' }}>
                                    { testRules[optionIndex].map(item => (
                                        rulesCMS ? (
                                            <div className='event-behavior-cms-item-container'>
                                                <button />
                                                <input type="text" />
                                            </div>
                                        ) : (
                                            <li>{item}</li>
                                        )
                                    )) }
                                </ul>
                                <button className='event-dresscode-cms-add' style={{ width: '150px', marginBottom: '30px', display: rulesCMS ? 'flex' : 'none' }}>
                                    <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                    Добавить пункт
                                </button>
                            </div>
                        ))
                    }
                    <button className='event-dresscode-cms-add' style={{ marginLeft: '15px', marginTop: '30px', width: '160px', display: rulesCMS ? 'flex' : 'none' }}>
                        <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                        Добавить раздел
                    </button>
                    <div style={{ 
                        position: 'relative', 
                        flex : 'none', 
                        flexDirection: 'column', 
                        marginLeft: '15px', 
                        alignItems: 'center',
                        display: rulesCMS ? 'flex' : 'none'
                    }}>
                        <div className={`event-behavior-alert-cantsave ${behaviorCancelWindow ? 'visible' : ''}`}>Вы не можете сохранить, пока не заполните все поля!</div>
                        <button 
                            className={`event-behavior-savebut ${behaviorSaveDenied ? 'denied' : ''}`} 
                            onClick={behaviorSaveDenied ? 
                                () => { 
                                    setBehaviorCancelWindow(true), 
                                    setTimeout(() => setBehaviorCancelWindow(false), 3000) 
                                } : handleBehaviorSave
                            }
                        >Сохранить</button>
                        <button className='event-behavior-savebut cancel'>Отменить изменения</button>
                    </div>
                </div>
            </div>
        </div>
    );
};