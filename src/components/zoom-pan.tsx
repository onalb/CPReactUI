import React, { useState } from 'react';

export const applyMouseEvents = (setZoomScale: any) => {
    // Variables
    let isDragging = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (event: any) => {
        isDragging = true;
        lastPosX = event.clientX;
        lastPosY = event.clientY;
      };
    
    const handleMouseMove = (event: any) => {
    if (isDragging) {
        const dx = event.clientX - lastPosX;
        const dy = event.clientY - lastPosY;
        view.pan({ x: dx, y: dy });
        view.applyTo(document.getElementById('main-element'));
        lastPosX = event.clientX;
        lastPosY = event.clientY;
    }
    };

    const handleMouseUp = () => {
    isDragging = false;
    };

    const handleWheel = (event: any) => {
    // Prevent the default zoom
    event.preventDefault();
    // Determine the zoom point (e.g., the current mouse position)
    const at = { x: event.clientX, y: event.clientY };
    // Determine the zoom amount based on the wheel delta
    const amount = event.deltaY < 0 ? 1.1 : 0.9;
    // Call the scaleAt function
    view.scaleAt(at, amount, setZoomScale);
    // Apply the transformation to the element you want to zoom
    view.applyTo(document.getElementById('main-element'));
    };

    window.addEventListener('load', (event) => {
    const mainElement = document.getElementById('main-element');
    const windowWidth = window.innerWidth;

    if (mainElement) {
        const rect = mainElement.getBoundingClientRect();
        
        if(rect.width < windowWidth) {
        const x = (windowWidth - rect.width) / 2;
        view.move({ x, y: 0 });
        view.applyTo(mainElement);
        // mainElement.style.justifyContent = 'center';
        } else {
        view.move({ x: 0, y: 0 });
        view.applyTo(mainElement);
        }
    }
    });

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel);

    return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('wheel', handleWheel);
    };
}

const view = (() => {
    const matrix = [1, 0, 0, 1, 0, 0]; // current view transform
    var m = matrix;             // alias 
    var scale = 1;              // current scale
    const pos = { x: 0, y: 0 }; // current position of origin
    var dirty = true;
    const API = {
      applyTo(el: any) {
        if (dirty) { this.update() }
        el.style.transform = `matrix(${m[0]},${m[1]},${m[2]},${m[3]},${m[4]},${m[5]})`;
        // No changes needed here, as this already applies the transformation allowing for movement out of viewport
      },
      update() {
        dirty = false;
        m[3] = m[0] = scale; // Scale X and Y equally
        m[2] = m[1] = 0; // No skew
        m[4] = pos.x; // Translate X
        m[5] = pos.y; // Translate Y
      },
      move(amount: any) {
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      pan(amount: any) {
        if (dirty) { this.update() }
        pos.x += amount.x;
        pos.y += amount.y;
        dirty = true;
      },
      scaleAt(at: any, amount: any, setZoomScale: any) {
        if (dirty) { this.update() }
        scale *= amount;
        console.log(scale);
        setZoomScale(scale);
        pos.x = at.x - (at.x - pos.x) * amount;
        pos.y = at.y - (at.y - pos.y) * amount;
        dirty = true;
      },
    };
    return API;
  })();

export default applyMouseEvents;

