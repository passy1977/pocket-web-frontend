'use strict';


import showAlert, { hideAlert, sanitize } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';

let globalSession = null;
let globalElmClicked = false;

function onButtonLeftImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  globalSession?.resetGuiCallbacks();
  globalSession.loadSync({
    path: '/home',
    title: 'Home'
  }, false);
  globalElmClicked = false;
}


export function onUpdateGui(session) {
  hideAlert();

  globalSession = session;

  session?.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  session?.gui?.buttonLeft1?.classList.add('collapse');
  session?.gui?.buttonRight0?.classList.add('collapse');
  session?.gui?.buttonRight1?.classList.add('collapse');

  document.getElementById('form').addEventListener('submit', async event => {
    event.preventDefault();

    if (globalElmClicked) {
      return;
    }
    globalElmClicked = true;

    hideAlert();

    const passwd = document.getElementById('passwd');
    const passwdInvalidFeedback = document.getElementById('passwd-invalid-feedback');
    const passwdNew = document.getElementById('passwd-new');
    const passwdNewInvalidFeedback = document.getElementById('passwd-new-invalid-feedback');
    const passwdConfirm = document.getElementById('passwd-confirm');
    const passwdConfirmInvalidFeedback = document.getElementById('passwd-confirm-invalid-feedback');

    let exit = false;

    if (passwd?.value === '') {
      passwd.classList.add('is-invalid');
      exit = true;
    } else {
      passwdInvalidFeedback.innerText = 'This field is required';
      passwd?.classList.remove('is-invalid');
    }

    if (passwdNew?.value === '') {
      passwdNew.classList.add('is-invalid');
      exit = true;
    } else {
      passwdNewInvalidFeedback.innerText = 'This field is required';
      passwdNew?.classList.remove('is-invalid');
    }

    if (passwdConfirm?.value === '') {
      passwdConfirm.classList.add('is-invalid');
      exit = true;
    } else {
      passwdConfirmInvalidFeedback.innerText = 'This field is required';
      passwdConfirm?.classList.remove('is-invalid');
    }

    if (passwd.value.length < PASSWD_MIN_LEN) {
      passwd.classList.add('is-invalid');
      passwdInvalidFeedback.innerText = `Password must be at least ${PASSWD_MIN_LEN} characters`;
      exit = true;
    }

    if (exit) {
      return;
    }

    if (passwdNew?.value !== passwdConfirm?.value) {
      passwdNew.value = '';
      passwdNewInvalidFeedback.innerText = 'Passwords mismatch';
      passwdNew.classList.add('is-invalid');

      passwdConfirm.value = '';
      passwdConfirmInvalidFeedback.innerText = 'Passwords mismatch';
      passwdConfirm.classList.add('is-invalid');
      return;
    }

    try {
      serverAPI.registration({
        jsonConfig: jsonConfig.value,
        email: sanitize(session.lastData.data, true),
        passwd: passwd.value,
        confirmPasswd: passwdConfirm.value
      }, ({ data, error }) => {
        if (data) {
          globalSession.loadSync(data);
        } else {
          if (error) {
            showAlert(error);
          } else {
            showAlert('unhandled error');
          }
        }
        globalElmClicked = false;
      });
    } catch (e) {
      showAlert(e);
      globalElmClicked = false;
    }
  });
}
