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
    const { ref: titleView, inView: isTitleView } = useInView({ threshold: 0.3 });

    const [titleViewState, setTitleViewState] = useState<boolean>(false)

    useEffect(() => {
        if(isTitleView) {
            setTitleViewState(true)
        }
    }, [isTitleView])



    const [dressCodeShow, setDressCodeShow] = useState<boolean>(() => {
        const showOptions = localStorage.getItem("showOptions")
        if(!showOptions) {
            return false
        } else {
            const parsedOptions = JSON.parse(showOptions)

            return parsedOptions.dressCodeShow
        }
    })

    const [dresscodeAcceptCMS, setDresscodeAcceptCMS] = useState<boolean>(true)
    const [dresscodeDenyCMS, setDresscodeDenyCMS] = useState<boolean>(false)

    useEffect(() => {
        const showOptions = {
            dressCodeShow
        }

        const jsonOptions = JSON.stringify(showOptions)

        localStorage.setItem("showOptions", jsonOptions)
    }, [dressCodeShow])


    // UX


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

    const handleDresscodeAcceptEdit = () => {
        
    }

    const handleDresscodeDenyEdit = () => {

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
                            { testDresscode.accept.map(item => (
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
                            { testDresscode.deny.map(item => (
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
        </div>
    );
};