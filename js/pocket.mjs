'use strict';

import serverAPI from './serverAPI.mjs';
import Session from './session.mjs';

// const debug = '/field-detail';
const debug = null;

let session = null;
let globalCallback = null;
let globalData = null;


export const EmptyGroup = Object.freeze({
  id: 0,
  server_id: 0,
  user_id: 0,
  group_id: 0,
  server_group_id: 0,
  title: '',
  icon: '',
  note: '',
  synchronized: false,
  deleted: false,
  timestamp_creation: 0,
});

export const EmptyGroupField = Object.freeze({
  id: 0,
  server_id: 0,
  user_id: 0,
  group_id: 0,
  server_group_id: 0,
  title: '',
  is_hidden: false,
  synchronized: false,
  deleted: false,
  timestamp_creation: 0,
});

export const EmptyField = Object.freeze({
  id: 0,
  server_id: 0,
  user_id: 0,
  group_id: 0,
  server_group_id: 0,
  group_field_id: 0,
  server_group_field_id: 0,
  title: '',
  value: '',
  is_hidden: false,
  synchronized: false,
  deleted: false,
  timestamp_creation: 0,
});

window.onbeforeunload = event => {
  const message = "Do you want really exit from Pocket 5";
  event.preventDefault();
  event.returnValue = message;
  return message;
}

window.onload = () => {
  try {
    serverAPI.showSpinner = showSpinner;
    serverAPI.hideSpinner = hideSpinner;
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
      EmptyGroup,
      data => {
        if (data.path === '/home') {
          console.debug('TODO', data);
        }
      }
    );
  } catch (error) {
    console.error('Failed to initialize session:', error);
    showAlert('An error occurred while initializing the session mechanism.');
  }

  try {
    if (!debug) {
      serverAPI.hello(({ data, error }) => {
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
      serverAPI.debug({
        path: debug, callback: ({ data, error }) => {
          if (data) {
            session.loadSync(data);
          } else {
            if (error) {
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
  if (msg === undefined || msg === null) {
    return false;
  }

  if (msg.constructor.name === "String") {
    if (msg.includes('Failed to fetch')) {
      msg = 'No server API connection available';
    }
  }


  session?.getGui?.alert.classList.remove('visually-hidden');
  const div = document.createElement('div');
  div.innerHTML = msg;
  session?.getGui?.alert.appendChild(div);
}

export function hideAlert() {
  if (session?.getGui?.alert) {
    session.getGui.alert.innerHTML = '';
    session.getGui.alert.classList.add('visually-hidden');
  }
}

export function sleep(ms = 1000) {
  if (typeof ms !== 'number') {
    throw new TypeError(`ms it's not a object`);
  }

  return new Promise(resolve => setTimeout(resolve, ms));
}

function callbackHandlerFalse(e) {
  if (globalCallback) {
    globalCallback(false, globalData);
    e.target.removeEventListener('click', callbackHandlerFalse);
  }
  globalCallback = null;
  globalData = null;
}

function callbackHandlerTrue(e) {
  if (globalCallback) {
    globalCallback(true, globalData);
    e.target.removeEventListener('click', callbackHandlerTrue);
  }
  globalCallback = null;
  globalData = null;
}

export function showModal({ title, message, close = null, confirm = null, data = null }, callback = null) {
  if (typeof title !== 'string') {
    throw new TypeError(`title it's not a string`);
  }

  if (message && typeof message !== 'string') {
    throw new TypeError(`message it's not a string`);
  }

  if (close && typeof close !== 'string') {
    throw new TypeError(`close it's not a string`);
  }

  if (callback && typeof callback !== 'function') {
    throw new TypeError(`callback it's not a function`);
  }

  if (close === null) {
    close = 'Ok';
  }

  globalCallback = callback;
  globalData = data;

  const modelElm = document.getElementById('modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modelElm, {
    focus: true
  });

  const titleEl = document.getElementById('modal-label');
  const messageEl = document.getElementById('modal-body');
  const closeHeaderEl = document.getElementById('modal-header-close');
  const closeEl = document.getElementById('modal-close');
  const confirmEl = document.getElementById('modal-confirm');

  titleEl.innerHTML = title;
  messageEl.innerHTML = message;
  closeEl.innerHTML = close;

  modelElm.addEventListener('hidden.bs.modal',callbackHandlerFalse);
  closeEl.addEventListener('click', callbackHandlerFalse);
  closeHeaderEl.addEventListener('click', callbackHandlerFalse);

  if (confirm !== null && typeof confirm === 'string') {
    confirmEl.innerHTML = confirm;

    confirmEl.addEventListener('click', callbackHandlerTrue);
    confirmEl.classList.remove('collapse');
  } else {
    confirmEl.classList.add('collapse');
  }


  modal.show();
}

export function resizeMenuOrContent() {
  const menu = document.getElementById('side-menu');
  const content = document.getElementById('content');

  const contentComputedStyle = window.getComputedStyle(content);

  const top = parseInt(contentComputedStyle.marginTop.slice(0, -2));
  const bottom = parseInt(contentComputedStyle.marginTop.slice(0, -2));
  const contentFullHeight = content.clientHeight + top + bottom;

  if(contentFullHeight > menu.clientHeight) {
    menu.style.height = `${content.clientHeight + top + bottom}px`;
  } else {
    content.style.height = `${menu.clientHeight - top - bottom + 1}px`;
  }
}

window.onresize = resizeMenuOrContent;

export function showSpinner() {
  document.getElementById('spinner').style.visibility =  'visible';
}

export function hideSpinner() {
  document.getElementById('spinner').style.visibility =  'hidden';
}

