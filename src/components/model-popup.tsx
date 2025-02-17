import React from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import '../styles/ImageZoom.css';

interface ModelPopupProps {
  message: string;
  setIsDeletePopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isDeletePopupVisible: boolean;
  handleDeleteImages: () => void;
}

const ModalPopup: React.FC<ModelPopupProps> = ({ message, setIsDeletePopupVisible, isDeletePopupVisible, handleDeleteImages }) => {
    const footerContent = (
        <div className="rounded-0">
            <Button 
                label="No" 
                icon="pi pi-times" 
                onClick={() => setIsDeletePopupVisible(false)} 
                className="p-button-text no-button" />
            <Button 
                label="Yes" 
                icon="pi pi-check" 
                onClick={() => {
                    setIsDeletePopupVisible(false);
                    handleDeleteImages();
                }} 
                autoFocus
                className="yes-button"
            />
        </div>
    );
    return (
        <div className="container-fluid position-absolute top-0 start-0 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50 p-0">
            <Dialog 
                headerClassName="rounded-0"
                header="Delete" 
                visible={isDeletePopupVisible} 
                style={{ width: '50vw', backgroundColor: 'rgba(20, 20, 20, 0.85)', color: 'white', border: '1px solid rgba(50, 50, 50, 0.85)'}} 
                onHide={() => {if (!isDeletePopupVisible) return; setIsDeletePopupVisible(false); }} 
                footer={footerContent}
                pt={{ 
                    root: { className: 'delete-popup-background' },
                    header: { className: 'delete-popup-header' },
                    content: { className: 'delete-popup-content' },
                    footer: { className: 'rounded-0 delete-popup-footer'},
                }}
            >
                <p className="m-0">
                    {message}
                </p>
            </Dialog>
        </div>
    );
};

export default ModalPopup;