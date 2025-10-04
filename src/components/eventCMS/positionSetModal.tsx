import { useEffect, useState } from 'react';

import { Position } from '../class/positionClass';
import { Volunteer } from '../class/volunteerClass.ts';
import { request } from '../../module/serverRequest';
import { errorLogger } from '../../module/errorLogger';

import { ReactComponent as SearchIcon } from '../../assets/icons/magnifying-glass-solid-full.svg'
import Loader from '../loader.tsx';

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    setErrorMessage: (msg: string | null) => void,
    setPositionSetMenu: (state: boolean) => any,
    positionSetMenu: boolean,
    volunteers: (Types.VolunteerData & Types.moreVolsData)[],
    setVolunteers: React.Dispatch<React.SetStateAction<(Types.VolunteerData & Types.moreVolsData)[]>>
    targetUser: number | null,
    positions: Position[],
    positionsData: Types.PositionData[],
    setPositionsData: React.Dispatch<React.SetStateAction<Types.PositionData[]>>
}

export const PositionSetModal = ({ setPositionSetMenu, positionSetMenu, setVolunteers, positionsData, setPositionsData, targetUser, volunteers, setErrorMessage, positions }: Props) => {
    const [loader, setLoader] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<number | null>(null)
    const [targetUserData, setTargetUserData] = useState<Types.VolunteerData & Types.moreVolsData | null>(null)
    const [targetUserClass, setTargetUserClass] = useState<Volunteer | null>(null)

    useEffect(() => {
        if(!targetUser) setTargetUserData(null)

        setTargetUserData(volunteers.filter(vol => vol.account.id === targetUser)[0])
        Volunteer.create(setErrorMessage, volunteers.filter(item => item.account.id === targetUser)[0])
            .then(item => { if(item instanceof Volunteer) setTargetUserClass(item) } )
    }, [targetUser])

    const handleStaffRoom = () => {
        
    }

    useEffect(() => {
        if(!selectedItem && selectedItem !== 0 || !targetUserClass) return
        
        const selectedPosition = positions.filter((_, i) => i === selectedItem)[0]


        selectedPosition.setVolunteer(targetUserClass, setPositionsData)
            .then(res => {
                if(res?.status === 200) {
                    setPositionSetMenu(false)
                    setVolunteers(prev => prev.map(vol => vol.id === targetUserClass.data.id ? { 
                        ...vol, 
                        posName: `${selectedPosition.actualData.name}-${selectedPosition.actualData.NameNumber}`,
                        posId: selectedPosition.actualData.id as number 
                    } : vol))
                }
            })
            .catch(err => {
                const response = err?.response?.data
                errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.status ?? 'Непредвиденная ошибка' })
            })
    }, [selectedItem, targetUserClass])

    return (
        <div className="profile-qrmodal-wrapper" style={{ display: positionSetMenu ? 'flex' : 'none' }} onClick={() => setPositionSetMenu(false)}>
            <div className="cms-positionadd-container" onClick={(e) => e.stopPropagation()}>
                <h2>Назначить позицию</h2>
                <button 
                    onClick={() => setTimeout(handleStaffRoom, 300)} 
                    className='cms-setpos-staffroom'
                >
                    { targetUserData?.inStaffRoom ? 'Выгнать из штаба' : 'Отправить в штаб' }
                </button>
                <div className='cms-posappoint-items-container'>
                    { loader ? <Loader style={{ marginTop: '50px' }} />
                    : positions.map((pos, key) => (
                        <div 
                            className={`cms-setpos-item-container`} 
                            onClick={ selectedItem ? 
                                () => setTimeout( () => setSelectedItem(null), 300 ) :
                                () => setTimeout( () => setSelectedItem(key), 300 )
                            }
                        >
                            <span className={`cms-setpos-item-name`} style={{ marginBottom: '10px' }}>{ `${pos.actualData.name}-${pos.actualData.NameNumber}` }</span>
                            <span className={`cms-setpos-item-name`}>Назначен</span>
                            <span className={`cms-setpos-item-value`}>{ pos.actualData.volunteer?.account.name ?? 'Нет' }</span>
                        </div>
                    )) 
                    }
                </div>
            </div>
        </div>
    );
};