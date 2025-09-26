import { useEffect, useRef } from 'react';
import { useZxing } from "react-zxing";

import '../../pages/style/eventCMS.css'

type Props = {
    qrMenu: boolean,
    setQrMenu: (value: boolean) => any,
    setQrResult: (value: string) => any
}

export const QRModal = ({ qrMenu, setQrResult, setQrMenu }: Props) => {

    const videoRef = useRef<HTMLVideoElement | null>(null)
    
    const { ref: zxingRef } = useZxing({
        onDecodeResult(result) {
            setQrResult(result.getText());
        },
        constraints: {
            video: { facingMode: "environment" },
        },
    });


    useEffect(() => {
        if (!qrMenu) {
            const stream = (videoRef.current?.srcObject as MediaStream) || null;
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [qrMenu]);

    return (
        <div className="profile-qrmodal-wrapper" style={{ display: qrMenu ? 'flex' : 'none' }} onClick={() => setQrMenu(false)}>
            <div className="event-qrscanner-container" onClick={(e) => e.stopPropagation()}>
                <h2>Сканировать профиль</h2>
                <ul>
                    <li>На устройстве волонтера зайдите в личный кабинет и нажмите “QR код Профиля”</li>
                    <li>Отсканируйте QR код через это меню</li>
                </ul>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5px' }}>
                    <video 
                        className='qrscanner' 
                        ref={el => {
                            zxingRef.current = el
                            videoRef.current = el
                        }} 
                        style={{ width: '250px', height: '250px', objectFit: 'cover'}}>
                    </video>
                </div>
            </div>
        </div>
    );
};