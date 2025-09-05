import { useState } from "react";

import './style/slider.css'

import { ReactComponent as LeftArrow } from "../assets/icons/caret-left-solid-full.svg"

type Props = {
    slides: React.ReactNode[]    
};

export const Slider = (props: Props) => {
  const [action, setAction] = useState<'left' | 'none' | 'right' | 'center'>('none')
  const [actionView, setActionView] = useState<'left' | 'none' | 'right' | 'center'>('none')
  const [disable, setDisable] = useState<boolean>(false)

  const slides = props.slides
  const [actualSlide, setActualSlide] = useState<number>(0)
  const [hiddenSlide, setHiddenSlide] = useState<number>(actualSlide === slides.length-1 ? 0 : actualSlide+1)


    const leftScroll = () => {
        if(disable) return

        setDisable(true)
        setTimeout(() => { setDisable(false) }, 800)

        setAction('left')
        setHiddenSlide(actualSlide === 0 ? slides.length - 1 : actualSlide - 1)

        setTimeout(() => {
        setActionView('right')
        setAction('center')
        
        setTimeout(() => {
            setActualSlide(actualSlide === 0 ? slides.length - 1 : actualSlide - 1)
            setActionView('none')
            setAction('none')
        }, 650)
        }, 100)
        
    }
    const rightScroll = () => {
        if(disable) return

        setDisable(true)
        setTimeout(() => { setDisable(false) }, 800)

        setAction('right')
        setHiddenSlide(actualSlide === slides.length - 1 ? 0 : actualSlide + 1)

        setTimeout(() => {
        setActionView('left')
        setAction('center')
        
        setTimeout(() => {
            setActualSlide(actualSlide === slides.length - 1 ? 0 : actualSlide + 1)
            setActionView('none')
            setAction('none')
        }, 650)
        }, 100)

    }


    // Автоматическое перелистывание

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         rightScroll()
    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, [])

    return (
        <>
            <div className='slider-container'>
                <div className={`slider-view-box ${actionView === 'left' ? 'right' : actionView === 'right' ? 'left' : ''}`}>
                { slides[actualSlide] }
                </div>
                <div className={`slider-scroll-box ${ action === 'right' ? 'view right' : action === 'center' ? 'view center' : action === 'left' ? 'view left' : action === 'none' ? '' : '' }`}>
                { slides[hiddenSlide] }
                </div>
            </div>
            <LeftArrow fill="#D9D9D9" onClick={leftScroll} className="slider-button" style={{ right: '140px', bottom: '50px' }}/>
            <LeftArrow fill="#D9D9D9" onClick={rightScroll} className="slider-button" style={{ left: '135px', bottom: '110px', rotate: '180deg' }}/>
        </>
    );
};