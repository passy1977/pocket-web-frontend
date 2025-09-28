'use strict';

import showAlert, { hideAlert, sleep, sanitize } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';
import { PASSWD_MIN_LEN } from '../js/constants.mjs';

let globalSession = null;

function clearSensitiveData() {
  const passwd = document.getElementById('passwd');
  const passwdConfirm = document.getElementById('passwd-confirm');
  if (passwd) passwd.value = '';
  if (passwdConfirm) passwdConfirm.value = '';
}


function onButtonLeftImage0Click() {
  globalSession?.loadSync({
    path: '/login',
    title: 'Login'
  })
}

export function onUpdateGui(session) {
  hideAlert();

  globalSession = session;

  session?.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  session?.gui?.buttonLeft1?.classList.add('collapse');
  session?.gui?.buttonRight0?.classList.add('collapse');
  session?.gui?.buttonRight1?.classList.add('collapse');

  if (!session.lastData?.data) {
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

    if (!session.lastData) {
      showAlert('Email empty');
      await sleep(1000);
      session.loadSync({
        path: '/login',
        title: 'Login'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(session.lastData.data)) {
      showAlert('Invalid email format');
      return;
    }

    if (passwd.value.length < PASSWD_MIN_LEN) {
      passwd.classList.add('is-invalid');
      passwdInvalidFeedback.innerText = `Password must be at least ${PASSWD_MIN_LEN} characters`;
      exit = true;
    }

    try {
      JSON.parse(jsonConfig.value);
    } catch (e) {
      jsonConfig.classList.add('is-invalid');
      showAlert('Invalid JSON configuration');
      return;
    }

    try {
      serverAPI.registration({
          jsonConfig: jsonConfig.value,
          email: sanitize(session.lastData.data, true),
          passwd: passwd.value,
          confirmPasswd: passwdConfirm.value
        }, ({ data, error }) => {
          clearSensitiveData(); 
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

