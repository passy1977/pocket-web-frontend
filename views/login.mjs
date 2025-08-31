'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert } from '../js/pocket.mjs';

export function onUpdateGui(session) {
  session?.gui?.buttonLeft0?.classList.add('collapse');
  session?.gui?.buttonLeft1?.classList.add('collapse');
  session?.gui?.buttonRight0?.classList.add('collapse');
  session?.gui?.buttonRight1?.classList.add('collapse');

  if (session.lastData?.data) {
    const email = document.getElementById('email');
    const passwd = document.getElementById('passwd');

    const dataSplit = session.lastData.data.split('|');

    email.value = dataSplit[0];
    passwd.value = dataSplit[1];
  }

  document.getElementById('form').addEventListener('submit', event => {
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

    if (execute) {
      serverAPI.login({
          email: email.value,
          passwd: passwd.value
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
    }
  });
}

