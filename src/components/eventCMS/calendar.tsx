import { eachDayOfInterval, format } from 'date-fns';

import { ReactComponent as CalendarIcon } from '../../assets/icons/calendar-days-solid-full.svg'
import { ReactComponent as ArrowLeftIcon } from '../../assets/icons/arrow-left-solid-full.svg'

type Props = {
    activeDays: string[],
    currentDay: string,
    setCurrentDay: (value: number) => any,
    setCalendar: (state: boolean) => any
}


export const Calendar = ({activeDays, currentDay, setCurrentDay, setCalendar}: Props) => {
    const start = new Date(2025, 8, 29)
    const end = new Date(2025, 10, 2)

    const days = eachDayOfInterval({start, end}).map(d => format(d, 'dd.MM.yy'))

    function chunkArray<T>(arr: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    const chunks = chunkArray(days, 7);

    const otherDays = ['29.09.25', '30.09.25', '01.11.25', '02.11.25']

    const handleSelectDay = (day: string) => {
        const foundIndex = activeDays.findIndex(value => value === day)
        setCurrentDay(foundIndex)
    }
    
    return (
        <>
            <div className='cms-calendar-header-container'>
                <div className='cms-calendar-title-container'>
                    <CalendarIcon fill='#1a1a1a' width={25} height={25}/>
                    <h2>Календарь</h2>
                </div>
                <div className='cms-calendar-but-exit-container' onClick={() => setTimeout(() => setCalendar(false), 300)}>
                    <ArrowLeftIcon fill='#1a1a1a' width={20} height={20}/>
                    <span>Вернуться на главную</span>
                </div>
            </div>
            <div className='cms-calendar-wrapper'>
                <div className='cms-calendar-daytitle-container'>
                    <span>Пн</span>
                    <span>Вт</span>
                    <span>Ср</span>
                    <span>Чт</span>
                    <span>Пт</span>
                    <span>Сб</span>
                    <span>Вс</span>
                </div>
                <div className='cms-calendar-main-container'>
                    {chunks.map((chunk) => (
                        <div className='cms-calendar-main-line'>
                            {chunk.map((day, keyInner) => (
                                <div
                                    key={keyInner}
                                    className={`cms-calendar-day-item ${
                                        otherDays.some(value => value === day) ? 'other' : 
                                        activeDays.some(value => value === day) ? 'active' : ''} 
                                        ${day === currentDay ? 'selected' : ''}`}
                                    style={{
                                        marginRight: (keyInner + 1) % 7 === 0 ? '0px' : '15px'
                                    }}
                                    onClick={ activeDays.some(value => value === day) ? () => handleSelectDay(day) : () => {} }
                                >
                                    {day.split('.')[0]}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};