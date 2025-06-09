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
        alert('An error occurred while initializing the session mechanism.');
    }

    showAlert('pippo');

    try {
        session
        .load(window.location.pathname)
        .catch(error => {
            console.error('Error loading resources:', error);
            alert(`An error occurred while loading the resources for ${window.location.pathname}: ${error.message}`);
        })
        .then(ret => {
            if (ret) {
                console.log("Route loaded successfully:", ret);
            } else {
                console.log("Failed to load route.");
            }
        });
    } catch (error) {
        console.error(error);
    }
});

export function showAlert(msg) {
    if(msg === undefined || msg === null) {
      return false;
    }

    if(typeof msg !== 'string') {
      throw new TypeError(`msg it's not a string`);
    }

    session?.getGui?.alert.classList.remove('visually-hidden');
    //session?.getGui?.alert.innerHTML = msg;
    console.log(session?.getGui?.alert);
}

export function hideAlert() {
    session?.getGui?.alert.classList.add('visually-hidden');
}