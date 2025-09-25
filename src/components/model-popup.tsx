import React from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import '../styles/image-grid.css';

interface ModelPopupProps {
    popupOptions: { isVisible: boolean; isYesNo: boolean; title: string, message: string };
    setPopupOptions: React.Dispatch<React.SetStateAction<any>>;
    handleDeleteImages: () => void;
}

const ModalPopup: React.FC<ModelPopupProps> = ({ popupOptions, setPopupOptions, handleDeleteImages }) => {
    const footerContent = (
        <div className="rounded-0">
            { popupOptions.isYesNo ? 
            (<><Button 
                label="No" 
                icon="pi pi-times" 
                onClick={() => setPopupOptions(prev => ({ ...prev, isVisible: false }))} 
                onTouchEnd={() => setPopupOptions(prev => ({ ...prev, isVisible: false }))}
                className="p-button-text no-button no-selection-removal-on-click" />
            <Button 
                label="Yes" 
                icon="pi pi-check" 
                onClick={() => {
                    setPopupOptions(prev => ({ ...prev, isVisible: false }));
                    handleDeleteImages();
                }}
                onTouchEnd={() => {
                    setPopupOptions(prev => ({ ...prev, isVisible: false }));
                    handleDeleteImages();
                }}
                autoFocus
                className="yes-button no-selection-removal-on-click"
            /></>)
            : 
            (<><Button 
                label="OK" 
                icon="pi pi-times" 
                onClick={() => setPopupOptions(prev => ({ ...prev, isVisible: false }))}
                onTouchEnd={() => setPopupOptions(prev => ({ ...prev, isVisible: false }))}
                className="p-button-text no-button no-selection-removal-on-click" /></>)
        }
        </div>
    );
    return (
        <div className="container-fluid position-absolute top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0">
            <Dialog 
                headerClassName="rounded-0"
                header={popupOptions.title} 
                visible={popupOptions.isVisible} 
                style={{ width: '50vw', backgroundColor: 'rgba(20, 20, 20, 0.85)', color: 'white', border: '1px solid rgba(50, 50, 50, 0.85)'}} 
                onHide={() => { if (!popupOptions.isVisible) return; setPopupOptions(prev => ({ ...prev, isVisible: false })); }}
                footer={footerContent}
                pt={{ 
                    root: { className: 'delete-popup-background' },
                    header: { className: 'delete-popup-header' },
                    content: { className: 'delete-popup-content' },
                    footer: { className: 'rounded-0 delete-popup-footer'},
                }}
            >
                <p className="m-0">
                    {popupOptions.message}
                </p>
            </Dialog>
        </div>
    );
};

export default ModalPopup;