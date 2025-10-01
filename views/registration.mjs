'use strict';

import showAlert, { hideAlert, sleep, sanitize, setBackHandler } from '../js/pocket.mjs';
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

  setBackHandler(onButtonLeftImage0Click);

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
    const passwdContainer = document.getElementById('passwd-container');
    const passwdInvalidFeedback = document.getElementById('passwd-invalid-feedback');
    const passwdConfirm = document.getElementById('passwd-confirm');
    const passwdConfirmContainer = document.getElementById('passwd-confirm-container');
    const passwdConfirmInvalidFeedback = document.getElementById('passwd-confirm-invalid-feedback');
    const jsonConfig = document.getElementById('json-config');
    const jsonConfigContainer = document.getElementById('json-config-container');
    const jsonConfigInvalid = document.getElementById('json-config-invalid');

    let exit = false;

    // JSON Config validation
    jsonConfigContainer.classList.remove('is-invalid');
    if (jsonConfig?.value === '') {
      jsonConfigInvalid.innerText = 'This field is required';
      jsonConfigContainer.classList.add('is-invalid');
      exit = true;
    } else {
      try {
        JSON.parse(jsonConfig.value);
      } catch (e) {
        jsonConfigInvalid.innerText = 'Invalid JSON configuration';
        jsonConfigContainer.classList.add('is-invalid');
        exit = true;
      }
    }

    // Password validation
    passwdContainer.classList.remove('is-invalid');
    if (passwd?.value === '') {
      passwdInvalidFeedback.innerText = 'This field is required';
      passwdContainer.classList.add('is-invalid');
      exit = true;
    } else if (passwd.value.length < PASSWD_MIN_LEN) {
      passwdInvalidFeedback.innerText = `Password must be at least ${PASSWD_MIN_LEN} characters`;
      passwdContainer.classList.add('is-invalid');
      exit = true;
    }

    // Confirm password validation
    passwdConfirmContainer.classList.remove('is-invalid');
    if (passwdConfirm?.value === '') {
      passwdConfirmInvalidFeedback.innerText = 'This field is required';
      passwdConfirmContainer.classList.add('is-invalid');
      exit = true;
    } else if (passwd?.value !== passwdConfirm?.value) {
      passwd.value = '';
      passwdInvalidFeedback.innerText = 'Passwords mismatch';
      passwdContainer.classList.add('is-invalid');

      passwdConfirm.value = '';
      passwdConfirmInvalidFeedback.innerText = 'Passwords mismatch';
      passwdConfirmContainer.classList.add('is-invalid');
      exit = true;
    }

    if (exit) {
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

