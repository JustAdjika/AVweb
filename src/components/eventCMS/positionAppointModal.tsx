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
    setPositionAppointMenu: (state: boolean) => any,
    positionAppointMenu: boolean,
    volunteers: (Types.VolunteerData & Types.moreVolsData)[],
    setErrorMessage: (msg: string | null) => void,
    currentPosition: Position | null,
    setPositionsData: React.Dispatch<React.SetStateAction<Types.PositionData[]>>
}

type publicUserData = {
    name: string,
    iin: string,
    id: number
}

export const PositionAppointModal = ({ setPositionAppointMenu, setPositionsData, currentPosition, positionAppointMenu, volunteers, setErrorMessage }: Props) => {
    const [searchInfo, setSearchInfo] = useState("")
    const [gotItems, setGotItems] = useState<publicUserData[]>([])
    const [loader, setLoader] = useState<boolean>(true)

    useEffect(() => {
        if(!positionAppointMenu || !currentPosition) return

        request({ method: 'GET', route: '/forms/profile/search', loadQuery: { info: searchInfo } })
            .then(res => {
                if(res.status === 200) { 
                    const container = res.container as publicUserData[]
                    

                    const filteredItems = container.filter(item => 
                        volunteers.some(vol => 
                            vol.account.id === item.id && 
                            vol.day === currentPosition.data.day && 
                            vol.eventId === currentPosition.data.eventId
                        )
                    )


                    setGotItems(filteredItems)
                }

                setLoader(false)
            })
            .catch(err => {
                const response: Types.Response = err.response?.data

                errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
            })
    }, [currentPosition])

    const handleSearch = () => {
        if(!currentPosition) return

        setLoader(true)
        request({ method: 'GET', route: '/forms/profile/search', loadQuery: { info: searchInfo } })
            .then(res => {
                if(res.status === 200) { 
                    const container = res.container as publicUserData[]

                    const filteredItems = container.filter(item => 
                        volunteers.some(vol => 
                            vol.account.id === item.id && 
                            vol.day === currentPosition.data.day && 
                            vol.eventId === currentPosition.data.eventId
                        )
                    )


                    setGotItems(filteredItems)
                }

                setLoader(false)
            })
            .catch(err => {
                const response: Types.Response = err.response?.data

                errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
            })
    }


    const handleAppoint = async (item:  publicUserData) => {
        if(!currentPosition) return
        setPositionAppointMenu(false);

        const currentVolunteer = volunteers.filter(vol => vol.account.id === item.id )

        const currentVolunteerClass = await Volunteer.create(setErrorMessage, currentVolunteer[0])

        if(!currentVolunteerClass) return
            
        currentPosition.setVolunteer(currentVolunteerClass, setPositionsData)
            .then(() => {
                setPositionsData((prev: (Types.PositionData)[]) => 
                    prev.map((item) => 
                        item.id !== currentPosition.actualData.id ? 
                            item :
                            { ...item, volunteer: currentVolunteerClass.data, volunteerId: currentVolunteerClass.data.id } as Types.PositionData
                ) )
            })
            .catch(err => {
                const response = err?.response?.data
                errorLogger(setErrorMessage, { status: response?.status ?? 500, message: response?.message ?? 'Непредвиденная ошибка' })
            })
    }

    return (
        <div className="profile-qrmodal-wrapper" style={{ display: positionAppointMenu ? 'flex' : 'none' }} onClick={() => setPositionAppointMenu(false)}>
            <div className="cms-positionadd-container" onClick={(e) => e.stopPropagation()}>
                <h2>Назначить волонтера</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <input 
                        type="text" 
                        value={searchInfo} 
                        placeholder='Поиск' 
                        className='cms-posappoint-input' 
                        onChange={(e) => setSearchInfo(e.target.value)} 
                    />
                    <button className='cms-posappoint-but-search' onClick={() => setTimeout(() => handleSearch(), 300)}>
                        <SearchIcon width={20} height={20} />
                        <span>Поиск</span>
                    </button>
                </div>
                <div className='cms-posappoint-items-container'>
                    { loader ? <Loader style={{ marginTop: '50px' }} />
                    : gotItems.map(item => (
                        <div className='cms-posappoint-item-container' onClick={() => handleAppoint(item)}>
                            <span className='cms-posappoint-item-name'>{ item.name }</span>
                            <span className='cms-posappoint-item-iin'>({ item.iin })</span>
                        </div>
                    )) 
                    }
                </div>
            </div>
        </div>
    );
};