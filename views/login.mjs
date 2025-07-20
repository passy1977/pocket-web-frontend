'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert } from '../js/pocket.mjs';

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft0?.classList.add('collapse');
    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');

    if(session.getLastData?.data) {
        const inputEmail = document.getElementById('inputEmail');
        const inputPasswd = document.getElementById('inputPasswd');

        const dataSplit = session.getLastData.data.split('|');

        inputEmail.value = dataSplit[0];
        inputPasswd.value = dataSplit[1];
    }

    document.getElementById('form').addEventListener('submit', event => {
        event.preventDefault();

        hideAlert();
        const inputEmail = document.getElementById('inputEmail');
        const inputPasswd = document.getElementById('inputPasswd');


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
            serverAPI.login({
                email: inputEmail?.value,
                passwd: inputPasswd?.value
            }, ({data, error}) => {
                    if(data) {
                        session.loadSync(data);
                    } else if(error) {
                        showAlert(error);
                    } else {
                        showAlert('unhandled error');
                    }
                }
            );
        }
    });
}

