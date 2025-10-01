'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert, hideSpinner, showSpinner, sleep } from '../js/pocket.mjs';
import { PASSWD_MIN_LEN } from '../js/constants.mjs';

let globalForm = null;

export async function onUpdateGui(session) {
  session?.gui?.buttonLeft0?.classList.add('collapse');
  session?.gui?.buttonLeft1?.classList.add('collapse');
  session?.gui?.buttonRight0?.classList.add('collapse');
  session?.gui?.buttonRight1?.classList.add('collapse');
  globalForm = document.getElementById('form');

  if (session.lastData?.data) {

    if(session.lastData?.data.indexOf('|') > 0) {
      //from registration
      const email = document.getElementById('email');
      const passwd = document.getElementById('passwd');

      const dataSplit = session.lastData.data.split('|');

      email.value = dataSplit[0];
      passwd.value = dataSplit[1];
    } else if(session.lastData?.data === 'logout') {
        showSpinner();
        await sleep(1000);
        hideSpinner();
        session.invalidate();
        serverAPI.invalidate();
        return;
    }
  }

  globalForm?.addEventListener('submit', event => {
    event.preventDefault();

    hideAlert();
    const email = document.getElementById('email');
    const passwd = document.getElementById('passwd');


    let execute = true;
    if (email?.value === '') {
      email.classList.add('is-invalid');
      execute = false;
    } else {
      email?.classList.remove('is-invalid');
    }

    if (passwd?.value === '') {
      passwd.classList.add('is-invalid');
      execute = false;
    } else {
      passwd?.classList.remove('is-invalid');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      email.classList.add('is-invalid');
      execute = false;
    }

    if (passwd.value.length < PASSWD_MIN_LEN) {
      passwd.classList.add('is-invalid');
      execute = false;
    }

    if (execute) {
      globalForm.disabled = true;

      serverAPI.login({
          email: email.value,
          passwd: passwd.value
        },  ({ data, error }) => {
          if (data) {
            session.loadSync(data);
          } else if (error) {
            showAlert(error);
          } else {
            showAlert('unhandled error');
          }
        }
      );
    }
  });
}

