import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to sync URL changes with parent window (Electron API)
 * This ensures that when React Router navigates, the parent iframe src is updated
 */
export const useParentUrlSync = () => {
  const location = useLocation();
  const lastSentUrl = useRef<string>('');
  const isInitialLoad = useRef<boolean>(true);

  useEffect(() => {
    // Skip initial load to prevent sync on page load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      lastSentUrl.current = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
      return;
    }

    // Notify parent window about URL change
    const fullUrl = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;
    
    // Only send message if URL actually changed and we're in an iframe
    if (window.parent !== window && fullUrl !== lastSentUrl.current) {
      lastSentUrl.current = fullUrl;
      console.log('Sending URL change to parent:', fullUrl);
      window.parent.postMessage({ 
        type: 'iframe-url-change', 
        url: fullUrl 
      }, '*');
    }
  }, [location]);
};
