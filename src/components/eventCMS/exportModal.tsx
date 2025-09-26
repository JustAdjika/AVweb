import '../../pages/style/eventCMS.css'

type Props = {
    setExportFor: (value: number) => any,
    exportFor: number,
    exportMenu: boolean,
    setExportMenu: (value: boolean) => any
    handleVolExport: () => any
}

export const ExportModal = ({ setExportFor, exportFor, exportMenu, setExportMenu, handleVolExport }: Props) => {
    return (
        <div className="profile-qrmodal-wrapper" style={{ display: exportMenu ? 'flex' : 'none' }} onClick={() => setExportMenu(false)}>
            <div className="event-export-container" onClick={(e) => e.stopPropagation()}>
                <h2>Экспорт</h2>
                <button 
                    className={`event-export-but-select ${exportFor === 0 ? 'selected' : ''}`}
                    onClick={() => setExportFor(0)}
                >Для координаторов</button>
                <button 
                    className={`event-export-but-select ${exportFor === 1 ? 'selected' : ''}`}
                    onClick={() => setExportFor(1)}
                >Для организаторов</button>
                <button className='event-export-but-confirm' onClick={() => handleVolExport()}>Подтвердить</button>
            </div>
        </div>
    );
};