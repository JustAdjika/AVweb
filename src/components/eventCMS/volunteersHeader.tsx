import { ReactComponent as WhatsappIcon } from '../../assets/icons/whatsapp-brands-solid-full.svg'
import { ReactComponent as QRcodeIcon } from '../../assets/icons/qrcode-solid-full.svg'
import { ReactComponent as FileExportIcon } from '../../assets/icons/file-arrow-down-solid-full.svg'

import * as Types from '../../../module/types/types.ts'

import '../../pages/style/eventCMS.css'

type Props = {
    setQrMenu: (value: boolean) => any,
    setExportMenu: (value: boolean) => any,
    userRole: Types.eventPermission | null,
    handleChangeLink: (e: any) => void
}

export const VolunteersHeader = ({ setQrMenu, setExportMenu, userRole, handleChangeLink }: Props) => {

    return (<>
        <div className='cms-headpanel-linkinput-container' style={{ marginRight: '10px', display: userRole === 'HCRD' ? 'flex' : 'none' }}>
            <WhatsappIcon className='cms-headpanel-linkinput-icon'/>
            <input 
                type="text" 
                className='cms-headpanel-linkinput-input' 
                placeholder='Ссылка на группу' 
                onBlur={handleChangeLink} 
            />
        </div>
        <div style={{ display: 'flex' }}>
            <div className='cms-headpanel-qr-but-container' onClick={() => setQrMenu(true)}>
                <QRcodeIcon className='cms-headpanel-function-but-icon'/>
                <span>QR</span>
            </div>
            <div className='cms-headpanel-export-but-container' onClick={() => setExportMenu(true)}>
                <FileExportIcon className='cms-headpanel-function-but-icon'/>
                <span>Экспорт</span>
            </div>
        </div>
    </>);
};