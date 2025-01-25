import React from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import '../styles/ImageZoom.css';

interface ModelPopupProps {
  setIsDeletePopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isDeletePopupVisible: boolean;
  handleDeleteImages: () => void;
}

const ModalPopup: React.FC<ModelPopupProps> = ({ setIsDeletePopupVisible, isDeletePopupVisible, handleDeleteImages }) => {
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
            {/* <Button label="Show" icon="pi pi-external-link" onClick={() => setIsDeletePopupVisible(true)} /> */}
            <Dialog 
                headerClassName="rounded-0"
                header="Delete" 
                visible={isDeletePopupVisible} 
                style={{ width: '50vw', backgroundColor: 'rgba(20, 20, 20, 0.75)', color: 'white' }} 
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
                    You are about to delete the selected images. KEPT images will retain. Are you sure you want to proceed?
                </p>
            </Dialog>
        </div>
    );
};

export default ModalPopup;