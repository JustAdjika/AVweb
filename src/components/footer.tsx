import './style/footer.css'

import { ReactComponent as TelegramIcon } from "../assets/icons/telegram-brands-solid-full.svg"
import { ReactComponent as InstagramIcon } from "../assets/icons/instagram-brands-solid-full.svg"
import { ReactComponent as TikTokIcon } from "../assets/icons/tiktok-brands-solid-full.svg"
import { ReactComponent as EmailIcon } from "../assets/icons/envelope-solid-full.svg"
import { ReactComponent as WhatsappIcon } from "../assets/icons/whatsapp-brands-solid-full.svg"
import { ReactComponent as AllianceFooterLogo } from "../assets/icons/Alliance footer logo.svg"

export const Footer = () => {
    return (
        <div className='footer-container'>
            <div style={{ display: 'flex', width: '100%', height: '50px', alignItems: 'center'  }}>
                <EmailIcon fill='#424242' width={30} height={30} style={{ width: '40px', height: '40px'}} /> 
                <span style={{ color: '#424242', display: 'inline-block', fontFamily: 'OpenSans_light' }}>alliance.of.volunteers@gmail.com</span>
            </div>
            <div style={{ display: 'flex', width: '100%', height: '50px', alignItems: 'center'  }}>
                <WhatsappIcon fill='#424242' width={30} height={30} style={{ width: '40px', height: '40px'}} /> 
                <span style={{ color: '#424242', display: 'inline-block', fontFamily: 'OpenSans_light' }}>+7 (707) 531 48 68</span>
            </div>
            <div>
                <AllianceFooterLogo style={{ marginTop: '10px' }} />
                <TelegramIcon width={40} height={40} fill='#424242' className='footer-social-icon' />
                <InstagramIcon width={40} height={40} fill='#424242' className='footer-social-icon' />
                <TikTokIcon width={40} height={40} fill='#424242' className='footer-social-icon' />
            </div>
            <span style={{ fontFamily: 'OpenSans_light', color: '#424242', fontSize: '15pt', marginTop: '20px' }}>© Copyright, 2025</span>
        </div>
    );
};