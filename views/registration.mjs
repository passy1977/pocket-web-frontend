"use strict"

import showAlert from "../js/pocket.mjs";

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft0?.classList.remove('collapse');
    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');
    document.getElementById('form').addEventListener('submit', event => {
        event.preventDefault();

        let passwdInput = document.getElementById('passwdInput');
        let confirmPasswdInput = document.getElementById('confirmPasswdInput');

        let exit = false;
        if(passwdInput?.value === '') {
            const div =  document.getElementById('passwdInputError');
            div.innerHTML = 'Password it\'s empty';
            div.classList.remove('collapse');
            exit = true;
        }

        if(confirmPasswdInput?.value === '') {
            const div =  document.getElementById('confirmPasswdInputError');
            div.innerHTML = 'Confirm password it\'s empty';
            div.classList.remove('collapse');
            exit = true;
        }

        if(exit) {
            return;
        }
        
        if(passwdInput?.value !== confirmPasswdInput?.value) {
            showAlert('Passwords mismatch');
            return;
        } 

        session.loadSynch('/');
        




      
    });

    let buttonLeftImage0 = session?.getGui?.buttonLeftImage0;
    buttonLeftImage0.src = '/images/ic_back.svg';
    buttonLeftImage0.addEventListener('click', () => 
        session.loadSynch('/')
    );
}

