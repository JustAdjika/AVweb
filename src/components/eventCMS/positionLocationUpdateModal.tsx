import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

import { Position } from '../class/positionClass';
import { request } from '../../module/serverRequest';
import { errorLogger } from '../../module/errorLogger';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    setPositionLocationMenu: (state: boolean) => any,
    positionLocationMenu: boolean,
    currentPosition: Position,
    setErrorMessage: (msg: string | null) => void
}

export const PositionLocationUpdateModal = ({ setPositionLocationMenu, positionLocationMenu, currentPosition, setErrorMessage }: Props) => {
    const [location, setLocation] = useState("")

    const handleConfirm = () => {
        setPositionLocationMenu(false);
            
        currentPosition.changeLocation(location)
            .catch(err => {
                const response = err?.response?.data
                errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
            })
    }

    useEffect(() => {
        if(!currentPosition) return
        
        setLocation(currentPosition.data.location ?? "")
    }, [currentPosition])

    return (
        <div className="profile-qrmodal-wrapper" style={{ display: positionLocationMenu ? 'flex' : 'none' }} onClick={() => setPositionLocationMenu(false)}>
            <div className="cms-location-container" onClick={(e) => e.stopPropagation()}>
                <h2>Заметка локации</h2>
                <input 
                    type="text" 
                    value={location} 
                    placeholder='Название позиции' 
                    className='cms-positionadd-input' 
                    onChange={(e) => setLocation(e.target.value)} 
                />
                <div className='cms-positionadd-but-confirm-wrapper' style={{ marginTop: '5px' }}><button onClick={() => setTimeout(() => handleConfirm(), 300)}>Изменить</button></div>
            </div>
        </div>
    );
};