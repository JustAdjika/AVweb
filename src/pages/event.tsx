import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

import { ReactComponent as ArrowIcon } from '../assets/icons/chevron-down-solid-full.svg'
import { ReactComponent as PenIcon } from '../assets/icons/pen-solid-full.svg'
import { ReactComponent as PlusIcon } from '../assets/icons/plus-solid-full.svg'
import { ReactComponent as CheckIcon } from '../assets/icons/check-solid-full.svg'

import { Event as EventClass } from '../components/class/eventClass.ts';
import { getUser } from '../module/getUser.ts';
import { request } from '../module/serverRequest.ts';
import { Footer } from '../components/footer.tsx';
import { Config } from '../../config.ts';

import * as Types from '../../module/types/types.ts'

import './style/eventMain.css'
import { errorLogger } from '../module/errorLogger.ts';

export const Event = ({ setErrorMessage }: { setErrorMessage: (message: string | null) => void }) => {

    const config = new Config()

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
    const [behaviorSaveDenied, setBehaviorSaveDenied] = useState<boolean>(false) // Состояние самой ошибки

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

    const [event, setEvent] = useState<EventClass | null>(null)
    const [currentAccount, setCurrentAccount] = useState<Types.Account | null>(null)
    const [isHCRD, setIsHCRD] = useState<boolean>(false)

    const [_infoSet, _setInfoSet] = useState<boolean>(false) // Флаг о полученной информации события, для отклонения повторных запросов




    // Получение события

    useEffect(() => {
        if(event) if(event instanceof EventClass) return

        EventClass.create(setErrorMessage, 'ATP 250')
            .then(gotEvent => {
                if(!gotEvent) return
                if(gotEvent instanceof EventClass) {
                    setEvent(gotEvent)
                } else {
                    errorLogger(setErrorMessage, { status: 500, message: 'Ошибка при поиске события' })
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [])


    // Получение аккаунта

    useEffect(() => {
        getUser({ setErrorMessage })
            .then(gotUser => {
                if(gotUser?.id) {
                    setCurrentAccount(gotUser)
                } else {
                    errorLogger(setErrorMessage, { status: 500, message: 'Ошибка при поиске пользователя' })
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [event])



    // Проверка прав аккаунта

    useEffect(() => {
        if(!event || !currentAccount) return
        const currentEvent = event.data as Types.Event

        request({ method: 'GET', route: `/perms/event/${currentEvent.id}/is/HCRD`, loadQuery: { userId: currentAccount.id } })
            .then(res => { 
                if(res.status === 200) {
                    const container = res.container as { result: boolean }

                    setIsHCRD(container.result)
                } else {
                    errorLogger(setErrorMessage, res)
                }
            })
            .catch(err => {
                errorLogger(setErrorMessage, { status: 500, message: `Непредвиденная ошибка: ${err}` })
            })
    }, [currentAccount])



    // Запрос информации о событии

    useEffect(() => {
        if(_infoSet) return

        if(event) if(event instanceof EventClass) {
            const info = event.data.info as Types.eventInfoObject

            setEventInfo(info)
            setNewEventInfo(info)
            _setInfoSet(true)
        }
    }, [event])




    // Банк данных

    const [eventInfo, setEventInfo] = useState<Types.eventInfoObject>({
        dressCode: {
            accept: [],
            deny: []
        },
        behavior: [],
        rules: []
    })

    const [newEventInfo, setNewEventInfo] = useState<Types.eventInfoObject>({
        dressCode: {
            accept: [],
            deny: []
        },
        behavior: [],
        rules: []
    })




    // Дресс код accept функции
    const handleDresscodeAcceptEdit = async() => {
        if(newEventInfo !== eventInfo) {
            if(!confirm('У вас остались не сохраненные изменения. Вы уверены, что хотите сбросить их?')) return
        }
        
        setNewEventInfo(eventInfo)
        setDresscodeAcceptCMS(true)
        setDresscodeDenyCMS(false)
        setBehaviorCMS(false)
        setRulesCMS(false)
    }

    const handleDressCodeAcceptCancel = () => {
        if(!confirm('Вы уверены, что хотите отменить все изменения?')) return 

        setDresscodeAcceptCMS(false)
        setNewEventInfo(eventInfo)
    }

    const handleDressCodeAcceptConfirm = async () => {
        if(!event) return

        try {
            const res = await event.updateInfo(setErrorMessage, newEventInfo)

            if(res?.status === 200) setEventInfo(newEventInfo) 
        } catch(err:any) {
            setNewEventInfo(eventInfo)
            setDresscodeAcceptCMS(false)
            throw errorLogger(setErrorMessage, { status: 500, message: 'Непредвиденная ошибка' })
        }
    }






    // Дресс код deny функции

    const handleDresscodeDenyEdit = () => {
        if(newEventInfo !== eventInfo) {
            if(!confirm('У вас остались не сохраненные изменения. Вы уверены, что хотите сбросить их?')) return
        }

        setNewEventInfo(eventInfo)

        setDresscodeAcceptCMS(false)
        setDresscodeDenyCMS(true)
        setBehaviorCMS(false)
        setRulesCMS(false)
    }

    const handleDressCodeDenyCancel = () => {
        if(!confirm('Вы уверены, что хотите отменить все изменения?')) return 

        setDresscodeDenyCMS(false)
        setNewEventInfo(eventInfo)
    }

    const handleDressCodeDenyConfirm = async () => {
        if(!event) return

        try {
            const res = await event.updateInfo(setErrorMessage, newEventInfo)

            if(res?.status === 200) setEventInfo(newEventInfo) 
        } catch(err:any) {
            setNewEventInfo(eventInfo)
            setDresscodeDenyCMS(false)
            throw errorLogger(setErrorMessage, { status: 500, message: 'Непредвиденная ошибка' })
        }
    }










    // Правила поведения функции
    const handleBehaviorEdit = () => {
        if(newEventInfo !== eventInfo) {
            if(!confirm('У вас остались не сохраненные изменения. Вы уверены, что хотите сбросить их?')) return
        }

        setNewEventInfo(eventInfo)

        setDresscodeAcceptCMS(false)
        setDresscodeDenyCMS(false)
        setBehaviorCMS(true)
        setRulesCMS(false)
    }

    const handleBehaviorCancel = () => {
        if(!confirm('Вы уверены, что хотите отменить все изменения?')) return 

        setBehaviorCMS(false)
        setNewEventInfo(eventInfo)
    }

    const handleBehaviorConfirm = async () => {
        if(!event) return

        try {
            const res = await event.updateInfo(setErrorMessage, newEventInfo)

            if(res?.status === 200) setEventInfo(newEventInfo) 
        } catch(err:any) {
            setNewEventInfo(eventInfo)
            setBehaviorCMS(false)
            throw errorLogger(setErrorMessage, { status: 500, message: 'Непредвиденная ошибка' })
        }
    }




    // Правила мероприятия функции
    const handleRulesEdit = () => {
        if(newEventInfo !== eventInfo) {
            if(!confirm('У вас остались не сохраненные изменения. Вы уверены, что хотите сбросить их?')) return
        }

        setNewEventInfo(eventInfo)

        setDresscodeAcceptCMS(false)
        setDresscodeDenyCMS(false)
        setBehaviorCMS(false)
        setRulesCMS(true)
    }

    const handleRulesCancel = () => {
        if(!confirm('Вы уверены, что хотите отменить все изменения?')) return 

        setRulesCMS(false)
        setNewEventInfo(eventInfo)
    }

    const handleRulesConfirm = async () => {
        if(!event) return

        console.log(123)

        try {
            const res = await event.updateInfo(setErrorMessage, newEventInfo)

            if(res?.status === 200) setEventInfo(newEventInfo) 
        } catch(err:any) {
            setNewEventInfo(eventInfo)
            setRulesCMS(false)
            throw errorLogger(setErrorMessage, { status: 500, message: 'Непредвиденная ошибка' })
        }
    }






    // Управление информацией события

    const updateInfo = {
        dresscode: {
            accept: {
                setValue: (key: number, value: string) => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.accept[key] = value

                    setNewEventInfo(data)
                },
                destroy: (key: number) => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.accept = data.dressCode.accept.filter((_, i) => i!== key)

                    setNewEventInfo(data)
                },
                add: () => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.accept.push("")

                    setNewEventInfo(data)
                }
            },
            deny: {
                setValue: (key: number, value: string) => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.deny[key] = value

                    setNewEventInfo(data)
                },
                destroy: (key: number) => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.deny = data.dressCode.deny.filter((_, i) => i!== key)

                    setNewEventInfo(data)
                },
                add: () => {
                    const data = structuredClone(newEventInfo)
                    data.dressCode.deny.push("")

                    setNewEventInfo(data)
                }
            }
        },
        behavior: {
            addChapter: () => {
                const data = structuredClone(newEventInfo)
                data.behavior.push([])

                setNewEventInfo(data)
            },
            addOption: (chapterKey: number) => {
                const data = structuredClone(newEventInfo)
                data.behavior[chapterKey].push("")

                setNewEventInfo(data)
            },
            destroy: (chapterKey: number, key: number) => {
                const data = structuredClone(newEventInfo)
                
                data.behavior[chapterKey] = data.behavior[chapterKey].filter((_, i) => i!== key)

                if(data.behavior[chapterKey].length === 0) {
                    data.behavior = data.behavior.filter((_, i) => i !== chapterKey)
                }

                setNewEventInfo(data)
            },
            setValue: (chapterKey: number, key: number, value: string) => {
                const data = structuredClone(newEventInfo)
                data.behavior[chapterKey][key] = value

                setNewEventInfo(data)
            },
        },
        rules: {
            addChapter: () => {
                const data = structuredClone(newEventInfo)
                data.rules.push([])

                setNewEventInfo(data)
            },
            addOption: (chapterKey: number) => {
                const data = structuredClone(newEventInfo)
                data.rules[chapterKey].push("")

                setNewEventInfo(data)
            },
            destroy: (chapterKey: number, key: number) => {
                const data = structuredClone(newEventInfo)
                data.rules[chapterKey] = data.rules[chapterKey].filter((_, i) => i!== key)

                if(data.rules[chapterKey].length === 0) {
                    data.rules = data.rules.filter((_, i) => i !== chapterKey)
                }

                setNewEventInfo(data)
            },
            setValue: (chapterKey: number, key: number, value: string) => {
                const data = structuredClone(newEventInfo)
                data.rules[chapterKey][key] = value

                setNewEventInfo(data)
            },
        }
    }




    // Проверка полей на пустое значение

    function isEmpty(data: any): boolean {
        if(typeof data === 'string') {
            return data.trim() === "" || !data
        }

        if(Array.isArray(data)) {
            return data.some(isEmpty)
        } else if(typeof data === 'object') {
            if(!data.accept || !data.deny) return true

            return data.accept.some(isEmpty) || data.deny.some(isEmpty)
        }

        return false
    }

    useEffect(() => {
        if (isEmpty(newEventInfo.behavior)) {
            setBehaviorSaveDenied(true)
        } else {
            setBehaviorSaveDenied(false)
        }

        if (isEmpty(newEventInfo.dressCode)) {
            setDresscodeSaveDenied(true)
        } else {
            setDresscodeSaveDenied(false)
        }

        if (isEmpty(newEventInfo.rules)) {
            setRulesSaveDenied(true)
        } else {
            setRulesSaveDenied(false)
        }
    }, [newEventInfo]);


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
                            { isHCRD ? ( !dresscodeAcceptCMS ?
                                <PenIcon className='event-dresscode-editicon' onClick={handleDresscodeAcceptEdit}/>
                            :
                                <CheckIcon 
                                    onClick={ !dresscodeSaveDenied ? 
                                        handleDressCodeAcceptConfirm : 
                                        () => { 
                                            setDresscodeCancelWindow(true), 
                                            setTimeout(() => setDresscodeCancelWindow(false), 3000) 
                                        }} 
                                    className='event-dresscode-editicon' 
                                    fill={ !dresscodeSaveDenied ? '#30762D' : '#afafaf'}
                                />
                            ) : null }
                            <h3 style={{ marginLeft: !isHCRD ? '20px' : '0px' }}>Разрешено</h3>
                            <div className={`event-dresscode-alert-cantsave ${dresscodeCancelWindow ? 'visible' : ''}`}>Вы не можете сохранить, пока не заполните все поля!</div>
                        </div>
                        <button onClick={handleDressCodeAcceptCancel} className='event-dresscode-cancel' style={{ display: dresscodeAcceptCMS ? 'block' : 'none' }}>Отменить</button>
                    </div>
                    { !dresscodeAcceptCMS ? (
                        <ul>
                            { eventInfo.dressCode.accept.map(item => ( <li>{item}</li> )) }
                        </ul>
                    ) : (
                        <div className='event-dresscode-cms-container'>
                            { newEventInfo.dressCode.accept.map((item, key) => (
                                <div className='event-dresscode-cms-item-container'>
                                    <button onClick={() => updateInfo.dresscode.accept.destroy(key)}/>
                                    <input type="text" value={item} onChange={(e) => updateInfo.dresscode.accept.setValue(key, e.target.value)}/>
                                </div>
                            )) }
                            <button className='event-dresscode-cms-add' onClick={() => updateInfo.dresscode.accept.add()}>
                                <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                Добавить пункт
                            </button>
                        </div>
                    ) }
                    <div>
                        <div>
                            { isHCRD ? ( !dresscodeDenyCMS ? 
                                <PenIcon className='event-dresscode-editicon' onClick={handleDresscodeDenyEdit}/>
                            :
                                <CheckIcon 
                                    onClick={ !dresscodeSaveDenied ? 
                                        handleDressCodeDenyConfirm : 
                                        () => { 
                                            setDresscodeCancelWindow(true), 
                                            setTimeout(() => setDresscodeCancelWindow(false), 3000) 
                                        }}  
                                    className='event-dresscode-editicon' 
                                    fill={ !dresscodeSaveDenied ? '#30762D' : '#afafaf'}
                                />
                            ) : null }
                            <h3 style={{ color: '#C0392B', marginLeft: !isHCRD ? '20px' : '0px' }}>Запрещено</h3>
                        </div>
                        <button className='event-dresscode-cancel' style={{ display: dresscodeDenyCMS ? 'block' : 'none' }} onClick={handleDressCodeDenyCancel}>Отменить</button>
                    </div>
                    { !dresscodeDenyCMS ? (
                        <ul>
                            { eventInfo.dressCode.deny.map(item => ( <li>{item}</li> )) }
                        </ul>
                    ) : (
                        <div className='event-dresscode-cms-container'>
                            { newEventInfo.dressCode.deny.map((item, key) => (
                                <div className='event-dresscode-cms-item-container'>
                                    <button onClick={() => updateInfo.dresscode.deny.destroy(key)} />
                                    <input type="text" value={item} onChange={(e) => updateInfo.dresscode.deny.setValue(key, e.target.value)}/>
                                </div>
                            )) }
                            <button className='event-dresscode-cms-add' onClick={() => updateInfo.dresscode.deny.add()}>
                                <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                Добавить пункт
                            </button>
                        </div>
                    ) }
                </div>
            </div>




            <div className='event-behavior-wrapper'>
                <div className='event-behavior-header' onClick={() => setBehaviorShow(!behaviorShow)}>
                    <h2>Правила поведения</h2>
                    <ArrowIcon className={`event-header-arrow ${ behaviorShow ? 'view' : 'hidden' }`}/>
                </div>
                <div className='event-behavior-container' style={{ display: behaviorShow ? 'block' : 'none', paddingBottom: behaviorCMS ? '20px' : '0px' }}>
                    <PenIcon className='event-behavior-editicon' onClick={handleBehaviorEdit} style={{ display: !behaviorCMS && isHCRD ? 'flex' : 'none' }}/>
                    { 
                        newEventInfo.behavior.map((_, optionIndex) => (
                            <div className='event-behavior-option-container'>
                                <h3>{`Раздел ${optionIndex+1}`}</h3>
                                <ul style={{ paddingLeft: behaviorCMS ? '10px' : '40px' }}>
                                    { newEventInfo.behavior[optionIndex].map((item, itemIndex) => (
                                        behaviorCMS ? (
                                            <div className='event-behavior-cms-item-container'>
                                                <button onClick={() => updateInfo.behavior.destroy(optionIndex, itemIndex)} />
                                                <input type="text" value={item} onChange={(e) => updateInfo.behavior.setValue(optionIndex, itemIndex, e.target.value)} />
                                            </div>
                                        ) : (
                                            <li>{item}</li>
                                        )
                                    )) }
                                </ul>
                                <button 
                                    className='event-dresscode-cms-add' 
                                    style={{ width: '150px', marginBottom: '30px', display: behaviorCMS ? 'flex' : 'none' }} 
                                    onClick={() => updateInfo.behavior.addOption(optionIndex)}
                                >
                                    <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                    Добавить пункт
                                </button>
                            </div>
                        ))
                    }
                    <button 
                        className='event-dresscode-cms-add' 
                        style={{ marginLeft: '15px', marginTop: '30px', width: '160px', display: behaviorCMS ? 'flex' : 'none' }} 
                        onClick={() => updateInfo.behavior.addChapter()}
                    >
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
                                } : handleBehaviorConfirm
                            }
                        >Сохранить</button>
                        <button className='event-behavior-savebut cancel' onClick={handleBehaviorCancel}>Отменить изменения</button>
                    </div>
                </div>
            </div>




            <div className='event-behavior-wrapper'>
                <div className='event-behavior-header' onClick={() => setRulesShow(!rulesShow)}>
                    <h2 style={{ fontSize: '16pt' }}>Правила мероприятия</h2>
                    <ArrowIcon className={`event-header-arrow ${ rulesShow ? 'view' : 'hidden' }`}/>
                </div>
                <div className='event-behavior-container' style={{ display: rulesShow ? 'block' : 'none', paddingBottom: rulesCMS ? '20px' : '0px' }}>
                    <PenIcon className='event-behavior-editicon' onClick={handleRulesEdit} style={{ display: !rulesCMS && isHCRD ? 'flex' : 'none' }}/>
                    { 
                        newEventInfo.rules.map((_, optionIndex) => (
                            <div className='event-behavior-option-container'>
                                <h3>{`Раздел ${optionIndex+1}`}</h3>
                                <ul style={{ paddingLeft: rulesCMS ? '10px' : '40px' }}>
                                    { newEventInfo.rules[optionIndex].map((item, itemIndex) => (
                                        rulesCMS ? (
                                            <div className='event-behavior-cms-item-container'>
                                                <button onClick={() => updateInfo.rules.destroy(optionIndex, itemIndex)}/>
                                                <input type="text" value={item} onChange={(e) => updateInfo.rules.setValue(optionIndex, itemIndex, e.target.value)}/>
                                            </div>
                                        ) : (
                                            <li>{item}</li>
                                        )
                                    )) }
                                </ul>
                                <button 
                                    className='event-dresscode-cms-add' 
                                    style={{ width: '150px', marginBottom: '30px', 
                                    display: rulesCMS ? 'flex' : 'none' }}
                                    onClick={() => updateInfo.rules.addOption(optionIndex)}
                                >
                                    <PlusIcon fill='#1a1a1a' style={{ width: '25px', height: '25px' }}/>
                                    Добавить пункт
                                </button>
                            </div>
                        ))
                    }
                    <button 
                        className='event-dresscode-cms-add' 
                        style={{ marginLeft: '15px', marginTop: '30px', width: '160px', display: rulesCMS ? 'flex' : 'none' }}
                        onClick={() => updateInfo.rules.addChapter()}
                    >
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
                        <div className={`event-behavior-alert-cantsave ${rulesCancelWindow ? 'visible' : ''}`}>Вы не можете сохранить, пока не заполните все поля!</div>
                        <button 
                            className={`event-behavior-savebut ${rulesSaveDenied ? 'denied' : ''}`} 
                            onClick={rulesSaveDenied ? 
                                () => { 
                                    setRulesCancelWindow(true), 
                                    setTimeout(() => setRulesCancelWindow(false), 3000) 
                                } : handleRulesConfirm
                            }
                        >Сохранить</button>
                        <button className='event-behavior-savebut cancel' onClick={handleRulesCancel}>Отменить изменения</button>
                    </div>
                </div>
            </div>


            <h2 className='event-video-h2'>Правила тенниса</h2>
            <video 
                width="320" 
                height="180" 
                controls 
                autoPlay={false}
                style={{ marginLeft: '50px', marginBottom: '50px' }}
            >
                <source src={`${config.serverDomain}/uploads/other/tennisVideo.mp4`} type="video/mp4" />
                Ваш браузер не поддерживает видео.
            </video>

            <Footer />
        </div>
    );
};