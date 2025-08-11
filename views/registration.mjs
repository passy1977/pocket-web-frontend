'use strict';

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

  if (!session.getLastData?.data) {
    throw 'Data null';
  }

  document.getElementById('form').addEventListener('submit', async event => {
    event.preventDefault();

    hideAlert();

    const passwd = document.getElementById('passwd');
    const passwdInvalidFeedback = document.getElementById('passwd-invalid-feedback');
    const passwdConfirm = document.getElementById('passwd-confirm');
    const passwdConfirmInvalidFeedback = document.getElementById('passwd-confirm-invalid-feedback');
    const jsonConfig = document.getElementById('json-config');


    let exit = false;

    if (jsonConfig?.value === '') {
      jsonConfig.classList.add('is-invalid');
      exit = true;
    } else {
      jsonConfig.classList.remove('is-invalid');
    }

    if (passwd?.value === '') {
      passwd.classList.add('is-invalid');
      exit = true;
    } else {
      passwdInvalidFeedback.innerText = 'This field is required';
      passwd?.classList.remove('is-invalid');
    }

    if (passwdConfirm?.value === '') {
      passwdConfirm.classList.add('is-invalid');
      exit = true;
    } else {
      passwdConfirmInvalidFeedback.innerText = 'This field is required';
      passwdConfirm?.classList.remove('is-invalid');
    }

    if (exit) {
      return;
    }

    if (passwd?.value !== passwdConfirm?.value) {
      passwd.value = '';
      passwdInvalidFeedback.innerText = 'Passwords mismatch';
      passwd.classList.add('is-invalid');

      passwdConfirm.value = '';
      passwdConfirmInvalidFeedback.innerText = 'Passwords mismatch';
      passwdConfirm.classList.add('is-invalid');
      return;
    }

    if (!session.getLastData) {
      showAlert('Email empty');
      await sleep(1000);
      session.loadSync({
        path: '/login',
        title: 'Login'
      });
      return;
    }

    try {
      serverAPI.registration({
          jsonConfig: jsonConfig.value,
          email: session.getLastData.data,
          passwd: passwd.value,
          confirmPasswd: passwdConfirm.value
        }, ({ data, error }) => {
          if (data) {
            session.loadSync(data);
          } else if (error) {
            showAlert(error);
          } else {
            showAlert('unhandled error');
          }
        }
      );
    } catch (e) {
      showAlert('Server json config empty');
    }

  });

}

