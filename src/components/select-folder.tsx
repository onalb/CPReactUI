import { useEffect } from "react";
import { openFolderInNewTab } from "../services/PhotoService";

const SelectFolder: React.FC = () => {
    const isOpenedOnBrowser = typeof navigator !== 'undefined' && navigator.userAgent !== undefined && !navigator.userAgent.includes('Electron');

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            if (data.type === 'openFolderInNewTab') {
                const folderPath = data.data.folderPath;
                console.log('Folder path received:', folderPath);

                if (isOpenedOnBrowser) {
                    const encodedFolderPath = encodeURIComponent(folderPath);
                    const url = `http://localhost:3000/image-grid/false/${encodedFolderPath}`;
                    console.log('Opening URL:', url);
                    window.open(url, '_blank');
                }
            }
        };
    
        return () => {
            socket.close();
        };
    }, []);

    const handleClick = () => {
        openFolderInNewTab(isOpenedOnBrowser);
    };
    
    return (
        <div>
            <button onClick={handleClick}>
                SELECT FOLDER
            </button>
        </div>
    );
}

export default SelectFolder;