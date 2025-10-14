'use strict';

import serverAPI from './server-api.mjs';
import Session from './session.mjs';

// const debug = '/change-passwd';
const debug = null;

let session = null;
let globalModalCallback = null;
let globalModalData = null;
let globalBackCallback = null;

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



window.onload = () => {
  // Initialize handlers to intercept back events
  initializeBackCallbacks();
  
  try {
    serverAPI.showSpinner = showSpinner;
    serverAPI.hideSpinner = hideSpinner;
    serverAPI.callbackLogout = error => {
      let data = '';

      if (error && error.message === 'Failed to fetch') {
        data = 'no-network';

        showAlert('No server API connection available');
        session.resetGui();
        closeSideMenu();
        serverAPI.invalidate();
        session.invalidate();

        showModal({
          title: 'Session expired',
          message: 'Your session has expired. Please log in again.',
          close: 'Close'
        });

      } else {
        data = 'expired';

        session.loadSync({
          path: '/login',
          title: 'Login',
          data,
        });// Back login

        serverAPI.invalidate();
        session.invalidate();

        try {
          serverAPI.hello(({ data, error }) => {
            if (!data) {
              showModal({
                title: 'Session expired',
                message: 'Your session has expired. Please log in again.',
                close: 'Close'
              });
              if (error) {
                showAlert(error);
              } else {
                showAlert('unhandled error');
              }
            }
          });
        } catch (e) {
          showAlert(e);
        }
      }

    };

    session = new Session({
        sideMenu: document.getElementById('side-menu'),
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
      EmptyGroup
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
      session.resetGui();
      closeSideMenu();

      showModal({
        title: 'Session expired',
        message: 'Your session has expired. Please log in again.',
        close: 'Close'
      });

    }
  }

  serverAPI?.stopHeartbeat();

  session?.gui?.alert.classList.remove('visually-hidden');
  const div = document.createElement('div');
  div.textContent = msg;
  session?.gui?.alert.appendChild(div);
}

export function hideAlert() {
  if (session?.gui?.alert) {
    session.gui.alert.innerHTML = '';
    session.gui.alert.classList.add('visually-hidden');
  }
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

  titleEl.textContent = sanitize(title);
  messageEl.innerHTML = message;
  closeEl.textContent = sanitize(close, true);

  // Clean up any existing event listeners to prevent duplicates
  modalElm.removeEventListener('hidden.bs.modal', callbackModalHandlerFalse);
  closeEl.removeEventListener('click', callbackModalHandlerFalse);
  closeHeaderEl.removeEventListener('click', callbackModalHandlerFalse);
  confirmEl.removeEventListener('click', callbackModalHandlerTrue);

  // Add event listeners
  modalElm.addEventListener('hidden.bs.modal', callbackModalHandlerFalse);
  closeEl.addEventListener('click', callbackModalHandlerFalse);
  closeHeaderEl.addEventListener('click', callbackModalHandlerFalse);

  // Handle focus management and accessibility
  modalElm.addEventListener('shown.bs.modal', function() {
    // Ensure aria-hidden is properly managed by Bootstrap
    modalElm.removeAttribute('aria-hidden');
  });

  modalElm.addEventListener('hide.bs.modal', function() {
    // Clear focus from any modal elements before hiding
    const focusedElement = modalElm.querySelector(':focus');
    if (focusedElement) {
      focusedElement.blur();
    }
  });

  if (confirm !== null && typeof confirm === 'string') {
    confirmEl.textContent = sanitize(confirm, true);
    confirmEl.addEventListener('click', callbackModalHandlerTrue);
    confirmEl.classList.remove('collapse');
  } else {
    confirmEl.classList.add('collapse');
  }

  modal.show();
}

export function showSpinner() {
  document.getElementById('spinner').style.visibility =  'visible';
}

export function hideSpinner() {
  document.getElementById('spinner').style.visibility =  'hidden';
}

/**
 * Set a custom function to be called when a back event is detected
 * @param {Function} callback - Function to call when the back button is pressed
 */
export function setBackCallback(callback) {
  if (callback && typeof callback !== 'function') {
    throw new TypeError('Callback must be a function or null');
  }
  globalBackCallback = callback;
}

/**
 * Internal function to handle back events
 */
function onBackEvent(event) {
  if (globalBackCallback && typeof globalBackCallback === 'function') {
    // Prevent default behavior if the handler returns false
    const result = globalBackCallback(event);
    if (result === false && event.preventDefault) {
      event.preventDefault();
    }
  }
}

/**
 * Initialize listeners to intercept back events
 */
function initializeBackCallbacks() {
  // Handle browser back button (mobile and desktop devices)
  window.addEventListener('popstate', onBackEvent);
  
  // // Handle mouse buttons (back/forward)
  document.addEventListener('mousedown', (event) => {
    // Button 3 = back button, Button 4 = forward button
    if (event.button === 3) {
      event.preventDefault(); // Prevent browser's default back action
      onBackEvent(event);
    }
  });
  
  // For some browsers, also use the mouseup event
  document.addEventListener('mouseup', (event) => {
    if (event.button === 3) {
      event.preventDefault(); // Prevent browser's default back action
      // Don't call onBackEvent here to avoid double execution
    }
  });
  
}

export function sanitize(value, remove = false) {
  if (typeof value !== 'string') {
    throw new TypeError(`value it's not a string`);
  }

  if (remove) {
    return value.replace(/[&<>"']/g, '');
  } else {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

export function closeSideMenu() {
  session?.gui.sideMenu.classList.remove('open');
}

export function toggleSideMenu() {
  session?.gui.sideMenu.classList.toggle('open');
}