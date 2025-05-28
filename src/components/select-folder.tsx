import { useEffect } from "react";
import { openFolderInNewTab } from "../services/PhotoService";

const SelectFolder: React.FC = () => {
    const isOpenedOnBrowser = typeof navigator !== 'undefined' && navigator.userAgent !== undefined && !navigator.userAgent.includes('Electron');

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'openFolderInNewTab') {
                const folderPath = data.data.folderPath;

                if (isOpenedOnBrowser) {
                    window.open(`http://localhost:3000/image-grid/false/${folderPath}`, '_blank'); // fix
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