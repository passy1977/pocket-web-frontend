"use strict";

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert } from '../js/pocket.mjs';

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft0?.classList.add('collapse');
    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');
    document.getElementById('form').addEventListener('submit', event => {
        event.preventDefault();

        hideAlert();
        let inputEmail = document.getElementById('inputEmail');
        let inputPasswd = document.getElementById('inputPasswd');

        let execute = true;
        if(inputEmail?.value === '') {
            inputEmail?.classList.add('is-invalid');
            execute = false;
        } else {
            inputEmail?.classList.remove('is-invalid');
        }

        if(inputPasswd?.value === '') {
            inputPasswd?.classList.add('is-invalid');
            execute = false;
        } else {
            inputPasswd?.classList.remove('is-invalid');
        }

        if(execute) {
            serverAPI.login(inputEmail?.value, inputPasswd.value, ({data, error}) => {
                if(data) {
                    session.loadSynch(data);
                } else {
                    if(error) {
                        showAlert(error);
                    } else {
                        showAlert('unhandled error');
                    }
                } 
            });
        }
        
    });
}

