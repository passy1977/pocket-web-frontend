"use strict";

import Session from "./session.mjs";
import Socket from "./socket.mjs";

let session = null;

window.addEventListener('load', () => {
    try {
        session = new Session({
                alert: document.getElementById('alert'),
                context: document.getElementById('context'),
                buttonLeft: document.getElementById('left'),
                buttonLeftImage: document.getElementById('left-image'),
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
        session.loadSynch(window.location.pathname);
    } catch (error) {
        showAlert(error);
    }
});

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