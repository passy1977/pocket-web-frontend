'use strict';

import serverAPI from './serverAPI.mjs';
import Session from './session.mjs';

// const debug = '/change-passwd';
const debug = null;

let session = null;
let globalModalCallback = null;
let globalModalData = null;

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

window.addEventListener('popstate', event => {
  event.preventDefault();
  const shouldExit = confirm('Do you want really exit from Pocket 5?');
  if (!shouldExit) {
    // Push a new state to prevent navigation
    history.pushState(null, '', window.location.href);
  }
});

// Prevent initial back navigation by pushing a state
history.pushState(null, '', window.location.href);

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
      },
      () => {
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

  if (msg.constructor.name === 'String') {
    if (msg.includes('Failed to fetch')) {
      msg = 'No server API connection available';
    }
  }


  session?.gui?.alert.classList.remove('visually-hidden');
  const div = document.createElement('div');
  div.innerHTML = msg;
  session?.gui?.alert.appendChild(div);
  resizeContent();
}

export function hideAlert() {
  if (session?.gui?.alert) {
    session.gui.alert.innerHTML = '';
    session.gui.alert.classList.add('visually-hidden');
  }
  resizeContent();
}

export function sleep(ms = 1000) {
  if (typeof ms !== 'number') {
    throw new TypeError(`ms it's not a object`);
  }

  return new Promise(resolve => setTimeout(resolve, ms));
}

function callbackModalHandlerFalse(e) {
  if (globalModalCallback) {
    globalModalCallback(false, globalModalData);
    e.target.removeEventListener('click', callbackModalHandlerFalse);
  }
  globalModalCallback = null;
  globalModalData = null;
}

function callbackModalHandlerTrue(e) {
  if (globalModalCallback) {
    globalModalCallback(true, globalModalData);
    e.target.removeEventListener('click', callbackModalHandlerTrue);
  }
  globalModalCallback = null;
  globalModalData = null;
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

  globalModalCallback = callback;
  globalModalData = data;

  const modalElm = document.getElementById('modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElm, {
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

  modalElm.addEventListener('hidden.bs.modal',callbackModalHandlerFalse);
  closeEl.addEventListener('click', callbackModalHandlerFalse);
  closeHeaderEl.addEventListener('click', callbackModalHandlerFalse);

  if (confirm !== null && typeof confirm === 'string') {
    confirmEl.innerHTML = confirm;

    confirmEl.addEventListener('click', callbackModalHandlerTrue);
    confirmEl.classList.remove('collapse');
  } else {
    confirmEl.classList.add('collapse');
  }


  modal.show();
}

export function resizeContent() {
  if (session.lastPath && session.lastPath !== '/home') {
    return;
  }
  const contentDefaultHeight = 200;
  const content = document.getElementById('content');
  const menu = document.getElementById('side-menu');
  const dataContainer = document.getElementById('data-container');
  content.style.height = `${contentDefaultHeight}px`;

  const contentComputedStyle = window.getComputedStyle(content);

  const top = parseInt(contentComputedStyle.marginTop.slice(0, -2));
  const bottom = parseInt(contentComputedStyle.marginTop.slice(0, -2));
  const contentFullHeight = content.clientHeight + top + bottom;
  const dataContainerFullHeight = dataContainer.clientHeight + 90;


  if (contentFullHeight > menu.clientHeight) {
    menu.style.height = `${contentFullHeight}px`;
  } else if (contentFullHeight < menu.clientHeight) {
    content.style.height = `${menu.clientHeight - top - bottom + 1}px`;
  }

  if(dataContainerFullHeight > contentFullHeight) {
    menu.style.height = `${dataContainerFullHeight + 58}px`;
    content.style.height = `${dataContainerFullHeight + 58 - top - bottom + 1}px`;
  }
}

window.onresize = resizeContent;

export function showSpinner() {
  document.getElementById('spinner').style.visibility =  'visible';
}

export function hideSpinner() {
  document.getElementById('spinner').style.visibility =  'hidden';
}

