type EventListenerRecord = {
    element: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  };
  
const eventListeners: EventListenerRecord[] = [];
  
export const addTrackedEventListener = (
    element: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(type, listener, options);
    eventListeners.push({ element, type, listener, options });
  };
  
  export const removeTrackedEventListeners = (element: EventTarget, type?: string) => {
    eventListeners.forEach(({ element: el, type: t, listener, options }, index) => {
      if (el === element && (!type || t === type)) {
        el.removeEventListener(t, listener, options);
        eventListeners.splice(index, 1);
      }
    });
  };