import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Extend Window interface to include electron
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        send: (channel: string, data?: any) => void;
      };
    };
  }
}

interface DropZoneProps {}

const DropZone: React.FC<DropZoneProps> = () => {
  const [folderPath, setFolderPath] = useState<string>('');
  const [isLightroomLoggedIn, setIsLightroomLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for Adobe OAuth success
    const handleAdobeOAuthSuccess = () => {
      console.log('Adobe authentication successful!');
      setIsLightroomLoggedIn(true);
    };

    // In a React app, we'll listen for custom events or use a message system
    window.addEventListener('adobe-oauth-success', handleAdobeOAuthSuccess);

    return () => {
      window.removeEventListener('adobe-oauth-success', handleAdobeOAuthSuccess);
    };
  }, []);

  const handleSelectFolder = async () => {
    try {
      const response = await axios.post('https://localhost:3080/api/open-directory-dialog');
      if (response.data && response.data.folderPath) {
        const selectedPath = response.data.folderPath;
        setFolderPath(selectedPath);
        handleFolderSelection(selectedPath);
      }
    } catch (error) {
      console.error('Error opening directory dialog:', error);
      // Fallback for web browsers
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.style.display = 'none';
      input.addEventListener('change', (event) => {
        const fileList = (event.target as HTMLInputElement).files;
        if (fileList && fileList.length > 0) {
          const file = fileList[0];
          const folderName = file.webkitRelativePath.split('/')[0];
          setFolderPath(folderName);
          handleFolderSelection(folderName);
        }
      });
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const items = event.dataTransfer.items;
    if (items && items.length > 0) {
      let foundDir = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
          const file = item.getAsFile();
          if (entry && entry.isDirectory) {
            foundDir = true;
            const path = (file as any).path || entry.name;
            setFolderPath(path);
            handleFolderSelection(path);
            break;
          }
        }
      }
      if (!foundDir) {
        alert("Please drop a folder, not a file");
      }
    }
  };

  const handleFolderSelection = (folderPath: string) => {
    if (folderPath) {
      const encodedPath = encodeURIComponent(folderPath);
      navigate(`/image-grid/false/${encodedPath}`);
    }
  };

  const handleLightroomLogin = () => {
    const redirectUri = 'https://localhost:3080/adobe-callback.html';
    const url = `https://ims-na1.adobelogin.com/ims/authorize?client_id=b9998fc5495748328c2a0a67c8059262&scope=openid,lr_partner_rendition_apis,AdobeID,offline_access,lr_partner_apis&redirect_uri=${redirectUri}&response_type=code`;
    window.open(url, '_blank');
  };

  // Listen for Adobe OAuth code from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'adobe-oauth-code') {
        // For Electron apps, we would send this to the main process
        if (window.electron && window.electron.ipcRenderer) {
          window.electron.ipcRenderer.send('adobe-oauth-code', event.data.code);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={styles.body}>
      <div 
        style={styles.dropZone}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="drop-zone"
      >
        <div style={styles.dropZonePrompt}>
          <div style={styles.icon}>
            <i className="fa-sharp fa-solid fa-folder"></i>
          </div>
          <p style={styles.dropZoneText}>Drag & drop a folder here</p>
          <p style={styles.dropZoneText}>OR</p>
          <p style={styles.dropZoneText}>Select a folder to begin working with files</p>
        </div>
        <button 
          onClick={handleSelectFolder}
          style={{...styles.actionButton, ...styles.dropZoneButton}}
        >
          Select Folder
        </button>
      </div>
      
      {folderPath && (
        <div style={{...styles.folderPath, opacity: 1}}>
          Selected folder: {folderPath}
        </div>
      )}
      
      <button 
        onClick={handleLightroomLogin}
        style={styles.actionButton}
        disabled={isLightroomLoggedIn}
      >
        Lightroom Login
        {isLightroomLoggedIn && (
          <i className="fa fa-check" style={{color: '#4caf50', marginLeft: '8px'}}></i>
        )}
      </button>
    </div>
  );
};

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: '#252525',
    color: '#e0e0e0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  dropZone: {
    border: '3px dashed #555',
    padding: '40px',
    textAlign: 'center' as const,
    margin: '0 auto',
    backgroundColor: '#333',
    transition: 'all 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90vh',
    maxWidth: '90vw',
    marginBottom: 0,
  },
  dropZonePrompt: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '10px',
    color: '#0078d4',
  },
  dropZoneText: {
    color: '#ccc',
    marginBottom: '20px',
  },
  folderPath: {
    minHeight: '40px',
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#333',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    color: '#e0e0e0',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  actionButton: {
    backgroundColor: '#444',
    color: 'white',
    border: '2px solid #ccc',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '20px',
  },
  dropZoneButton: {
    marginTop: '20px',
    backgroundColor: '#0078d4',
  },
};

// Add CSS for drag-over state
const globalStyles = `
  .drop-zone.drag-over {
    border-color: #0078d4;
    background-color: rgba(0, 120, 212, 0.1);
  }
  
  .drop-zone button:hover {
    background-color: #106ebe;
  }
  
  button:hover {
    background-color: #9b9b9b;
  }
`;

// Inject global styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = globalStyles;
  document.head.appendChild(styleElement);
}

export default DropZone;
