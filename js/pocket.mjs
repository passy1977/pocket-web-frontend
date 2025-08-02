'use strict';

import serverAPI from './serverAPI.mjs';
import Session from './session.mjs';

let session = null;

const debug = null;

window.onload = () => {
    try {
        session = new Session({
                alert: document.getElementById('alert'),
                context: document.getElementById('context'),
                buttonLeft0: document.getElementById('left-0'),
                buttonLeftImage0: document.getElementById('left-image-0'),
                buttonLeft1: document.getElementById('left-1'),
                buttonLeftImage1: document.getElementById('left-image-1'),
                title: document.getElementById('title'),
                buttonRight0: document.getElementById('right-0'),
                buttonRightImage0: document.getElementById('right-image-0'),
                buttonRight1: document.getElementById('right-1'),
                buttonRightImage1: document.getElementById('right-image-1')
            },
            data => {
                if(data.path === '/home') {
                    console.debug('TODO', data);
                }
            }
        );

    } catch (error) {
        console.error('Failed to initialize session:', error);
        showAlert('An error occurred while initializing the session mechanism.');
    }

    try {
      if(!debug)  {
        serverAPI.hello( ({data, error}) => {
          if (data) {
            session.loadSync(data);
          } else {
            if (error) {
              showAlert(error);
            } else {
              showAlert('unhandled error');
            }
          }
        });
      } else {
        serverAPI.debug( { path: debug, callback: ({data, error}) => {
            if(data) {
              session.loadSync(data);
            } else {
              if(error) {
                showAlert(error);
              } else {
                showAlert('unhandled error');
              }
            }
          }
        });
      }



    } catch (error) {
        showAlert(error);
    }
};

export default function showAlert(msg) {
    if(msg === undefined || msg === null) {
      return false;
    }

    if(msg === 'TypeError: Failed to fetch') {
      msg = 'No server API connection';
    }

    session?.getGui?.alert.classList.remove('visually-hidden');
    const div = document.createElement('div');
    div.innerHTML = msg;
    session?.getGui?.alert.appendChild(div);
}

export function hideAlert() {
    if(session?.getGui?.alert) {
        session.getGui.alert.innerHTML = '';
        session.getGui.alert.classList.add('visually-hidden');
    }
}

export function sleep(ms = 1000) {
  if(typeof ms !== 'number') {
    throw new TypeError(`ms it's not a object`);
  }

  return new Promise(resolve => setTimeout(resolve, ms));
}

export function showModal({title, message, close, confirm, data = null}, callback) {
  if(typeof title !== 'string') {
    throw new TypeError(`title it's not a string`);
  }

  if(typeof message !== 'string') {
    throw new TypeError(`message it's not a string`);
  }

  if(typeof close !== 'string') {
    throw new TypeError(`close it's not a string`);
  }

  if(typeof callback !== 'function') {
    throw new TypeError(`callback it's not a function`);
  }

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal'));
  const titleEl = document.getElementById('modal-label');
  const messageEl = document.getElementById('modal-body');
  const closeHeaderEl = document.getElementById('modal-header-close');
  const closeEl = document.getElementById('modal-close');
  const confirmEl = document.getElementById('modal-confirm');

  titleEl.innerHTML = title;
  messageEl.innerHTML = message;
  closeEl.innerHTML = close;

  if (closeEl.onclick) {
    closeEl.removeEventListener('click', closeEl.onclick);
  }
  closeEl.addEventListener('click', () => callback(false, data));

  if (closeHeaderEl.onclick) {
    closeHeaderEl.removeEventListener('click', closeEl.onclick);
  }
  closeHeaderEl.addEventListener('click', () => callback(false, data));

  if(confirm !== null && typeof confirm === 'string') {
    confirmEl.innerHTML = confirm;
    if (confirmEl.onclick) {
      confirmEl.removeEventListener('click', closeEl.onclick);
    }
    confirmEl.addEventListener('click', () => callback(true, data));
    confirmEl.classList.remove('collapse');
  } else {
    confirmEl.classList.add('collapse');
  }


  modal.show();
}