import { useEffect, useState, useRef } from 'react';

import { Event as EventClass } from '../class/eventClass.ts';
import { Position } from '../class/positionClass.ts';

import { ReactComponent as PersonAlertIcon } from '../../assets/icons/person-circle-exclamation-solid-full.svg'

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'


type Props = {
    handleContextMenu: <T extends Types.contextMenuType>(loadData: T, e:any) => void,
    positions: Position[],
    setPositions: (value: Position[]) => any,
    _dayLoaded: boolean,
    setErrorMessage: (msg: string | null) => void,
    event: EventClass | null,
    currentDay: string,
    setMenuVisible: (state: boolean) => any
}

export const Positions = ({ handleContextMenu, setMenuVisible, positions, setPositions, _dayLoaded, event, currentDay, setErrorMessage }: Props) => {

    const [focusPosition, setFocusPosition] = useState<number | null>(null)

    const [_volGot, _setVolGot] = useState(false)

    const scrollRef = useRef<HTMLDivElement | null>(null)
    

    // Получение списка волонтёров

    useEffect(() => {
        if(_volGot || !event || !_dayLoaded) return 

        Position.create(setErrorMessage, event.data.id as number, currentDay)
            .then(container => {
                if(container) setPositions(container)
            })
    }, [event, _dayLoaded])



    // Отслеживание скролла
    useEffect(() => {
        const handleScroll = () => {
            setMenuVisible(false)
        }        

        scrollRef?.current?.addEventListener('scroll', handleScroll);

        return () => scrollRef?.current?.removeEventListener('scroll', handleScroll);
    }, [])



    



    const alertStyle = {
        backgroundColor: '#C21706',
        height: '25px',
        width: '50px',
        color: '#D9D9D9',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }



    return (
        <div className='cms-table-container'>
            <div className='cms-table-header'>
                <div className='cms-table-cell apos'>№</div>
                <div className='cms-table-cell bpos'>Название</div>
                <div className='cms-table-cell-more-wrapper'>
                    <div className='cms-table-cell cpos'>Public ID</div>
                    <div className='cms-table-cell dpos'>Назначенный</div>
                </div>
            </div>
            <div className='cms-table-main' ref={scrollRef}>
                {positions.map((item, i) => item.data.id !== focusPosition ? (
                    <div 
                        className={`cms-table-object-container`} 
                        onClick={() => setFocusPosition(item.data.id as number) }
                        onContextMenu={(e) => { e.preventDefault(); handleContextMenu<Position>(item, e) }}
                    >
                        <div className='cms-table-cell apos'>
                            <div>{ i+1 }</div>
                            <PersonAlertIcon width={25} height={25} fill='#C21706' style={{ display: !item.data.volunteerId ? 'flex' : 'none'}}/>
                        </div>
                        <div className='cms-table-cell bpos'>{ `${item.data.name}-${item.data.NameNumber}` }</div>
                        <div className='cms-table-cell-more-wrapper'>
                            <div className='cms-table-cell cpos'>{ item.data.publicId }</div>
                            <div className='cms-table-cell dpos'>
                                <div style={!item.data.volunteer?.account.name ? alertStyle : {}}>{ item.data.volunteer?.account.name ?? 'Нет' }</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div 
                            className={`cms-table-object-container vol selected`} 
                            onClick={() => setFocusPosition(null) }
                            onContextMenu={(e) => { e.preventDefault(); handleContextMenu<Position>(item, e) }}
                        >
                            <div className='cms-table-cell apos'>
                                <div>{ i+1 }</div>
                                <PersonAlertIcon width={25} height={25} fill='#C21706' style={{ display: !item.data.volunteerId ? 'flex' : 'none'}} />
                            </div>
                            <div className='cms-table-cell bpos'>{ `${item.data.name}-${item.data.NameNumber}` }</div>
                            <div className='cms-table-cell-more-wrapper'>
                                <div className='cms-table-cell cpos'>{ item.data.publicId }</div>
                                <div className='cms-table-cell dpos'>
                                    <div style={!item.data.volunteer?.account.name ? alertStyle : {}}>{ item.data.volunteer?.account.name ?? 'Нет' }</div>
                                </div>
                            </div>
                        </div>
                        <div 
                            className={`cms-table-object-info-position-container vol`} 
                            onClick={() => setFocusPosition(null)}
                            onContextMenu={(e) => { e.preventDefault(); handleContextMenu<Position>(item, e) }}
                        >
                            <div className='cms-table-object-more-wrapper'>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Public ID</span>
                                    <div>{item.data.publicId}</div>
                                </div>
                                <div className='cms-table-object-info-item-wrapper'>
                                    <span>Назначенный</span>
                                    <div style={!item.data.volunteer?.account.name ? alertStyle : {}}>{item.actualData.volunteer?.account.name ?? 'Нет'}</div>
                                </div>
                            </div>
                            <div className='cms-table-object-info-item-location-wrapper'>
                                <span style={{ marginTop: '10px' }}>Локация</span>
                                <div className='cms-table-object-info-item-location-value'>{item.actualData.location ?? ''}</div>
                            </div>
                        </div>
                    </>
                ))}
            </div>
        </div>
    );
};