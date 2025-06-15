"use strict";

import Session from "./session.mjs";

let session = null;

window.onload = () => {
    try {
        session = new Session({
                alert: document.getElementById('alert'),
                context: document.getElementById('context'),
                buttonLeft0: document.getElementById('left-0'),
                buttonLeftImage0: document.getElementById('left-image-0'),
                buttonLeft1: document.getElementById('left-1'),
                buttonLeftImage1: document.getElementById('left-image-1'),
                title: document.getElementById('title'),
                buttonRight0: document.getElementById('right-0'),
                buttonRight0Image: document.getElementById('right-0-image'),
                buttonRight1: document.getElementById('right-1'),
                buttonRight1Image: document.getElementById('right-1-image')
            },
            getLastPath => {
                if(getLastPath === '/home') {
                    console.debug(getLastPath);
                }
            }
        );

    } catch (error) {
        console.error('Failed to initialize session:', error);
        showAlert('An error occurred while initializing the session mechanism.');
    }

    try {
        session.loadSynch({path: window.location.pathname, title: "Login"});
    } catch (error) {
        showAlert(error);
    }
};

export default function showAlert(msg) {
    if(msg === undefined || msg === null) {
      return false;
    }

    session?.getGui?.alert.classList.remove('visually-hidden');
    
    const div = document.createElement('div');
    div.innerHTML = msg;
    session?.getGui?.alert.appendChild(div);
}

export function hideAlert() {
    session?.getGui?.alert.classList.add('visually-hidden');
}