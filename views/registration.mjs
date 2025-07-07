'use strict'

import showAlert, { hideAlert, sleep } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';

export function onUpdateGui(session) {

    session?.getGui?.buttonLeft0.classList.remove('collapse');
    const buttonLeftImage0 = session?.getGui?.buttonLeftImage0;
    buttonLeftImage0.src = '/images/ic_back.svg';
    buttonLeftImage0.addEventListener('click', () =>
      session.loadSync({
          path: '/login',
          title: 'Login'
      })
    );

    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');

    if(!session.getLastData?.data) {
        throw 'Data null';
    }

    document.getElementById('form').addEventListener('submit', async event => {
        event.preventDefault();

        hideAlert();

        const inputPasswd = document.getElementById('inputPasswd');
        const inputPasswdConfirm = document.getElementById('inputPasswdConfirm');
        const jsonConfig = document.getElementById('jsonConfig');

        let exit = false;
        if (inputPasswd?.value === '') {
            inputPasswd?.classList.add('is-invalid');
            exit = true;
        } else {
            inputPasswd?.classList.remove('is-invalid');
        }

        if (inputPasswdConfirm?.value === '') {
            inputPasswdConfirm?.classList.add('is-invalid');
            exit = true;
        } else {
            inputPasswdConfirm?.classList.remove('is-invalid');
        }

        if (exit) {
            return;
        }

        if (inputPasswd?.value !== inputPasswdConfirm?.value) {
            inputPasswd.value = '';
            inputPasswdConfirm.value = '';
            showAlert('Passwords mismatch');
            return;
        }

        if (jsonConfig?.value === '') {
            showAlert('Server json config empty');
            return;
        }

        if (!session.getLastData) {
            showAlert('Email empty');
            await sleep(1000);
            session.loadSync({
                path: '/login',
                title: 'Login'
            })
            return;
        }

        try {
            serverAPI.registration({
                jsonConfig: jsonConfig.value,
                email: session.getLastData.data,
                passwd: inputPasswd.value,
                confirmPasswd: inputPasswdConfirm.value,
                callback: ({data, error}) => {
                    if(data) {
                        session.loadSync(data);
                    } else if(error) {
                        showAlert(error);
                    } else {
                        showAlert('unhandled error');
                    }
                }
            });
        } catch (e) {
            showAlert('Server json config empty');
        }

    });

}

