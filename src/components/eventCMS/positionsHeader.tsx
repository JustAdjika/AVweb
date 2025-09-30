import { ReactComponent as PlusIcon } from '../../assets/icons/plus-solid-full.svg'

import '../../pages/style/eventCMS.css'

type Props = {
    setPositionAddMenu: (state: boolean) => any
}

export const PositionsHeader = ({ setPositionAddMenu }: Props) => {

    return (<>
        <div style={{ display: 'flex' }}>
            <div className='cms-headpanel-posadd-but-container' onClick={() => setTimeout(() => setPositionAddMenu(true),300)} style={{ height: '33px' }}>
                <PlusIcon className='cms-headpanel-function-but-icon' style={{ width: '28px', height: '28px' }}/>
                <span style={{ fontSize: '13pt' }}>Добавить позицию</span>
            </div>
        </div>
    </>);
};