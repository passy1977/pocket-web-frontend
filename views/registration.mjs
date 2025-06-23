'use strict'

import showAlert from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft0?.classList.remove('collapse');
    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');
    document.getElementById('form').addEventListener('submit', event => {
        event.preventDefault();

        const inputEmail = document.getElementById('inputEmail');
        const inputPasswd = document.getElementById('inputPasswd');
        const inputPasswdConfirm = document.getElementById('inputPasswdConfirm');
        const jsonConfig = document.getElementById('jsonConfig');

        let exit = false;
        if(inputEmail?.value === '') {
            const div =  document.getElementById('inputEmailError');
            div.innerHTML = 'Email it\'s empty';
            div.classList.remove('collapse');
            exit = true;
        }

        if(inputPasswd?.value === '') {
            const div =  document.getElementById('inputPasswdError');
            div.innerHTML = 'Password it\'s empty';
            div.classList.remove('collapse');
            exit = true;
        }

        if(inputPasswdConfirm?.value === '') {
            const div =  document.getElementById('inputPasswdConfirmError');
            div.innerHTML = 'Confirm password it\'s empty';
            div.classList.remove('collapse');
            exit = true;
        }

        if(exit) {
            return;
        }
        
        if(inputPasswd?.value !== inputPasswdConfirm?.value) {
            inputPasswd.value = '';
            inputPasswdConfirm.value = '';
            showAlert('Passwords mismatch');
            return;
        } 

        if(jsonConfig?.value === '') {
            showAlert('Server json config empty');
            return;
        }

        try {
            serverAPI.registration({jsonConfig: jsonConfig.value, email: inputEmail?.value, inputPasswd: inputPasswd.value, confirmPasswdInput: inputPasswdConfirm.value});
        } catch (e) {
            showAlert('Server json config empty');
        }

    });

    let buttonLeftImage0 = session?.getGui?.buttonLeftImage0;
    buttonLeftImage0.src = '/images/ic_back.svg';
    buttonLeftImage0.addEventListener('click', () => 
        session.loadSync({
            path: '/login',
            title: 'Login'
        })
    );
}

