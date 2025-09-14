'use strict';

import showAlert, { hideAlert } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';

let globalSession = null;
let globalFormFile = null;
let globalButton = null;
let globalElmClicked = false;
let globalFileSize = 0;

function onFileChanged() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  globalButton.disabled = false;
  globalElmClicked = false;
}

function callbackGetFileSize(event) {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    globalFileSize = file.size;
  }
  globalElmClicked = false;
}

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

  globalFormFile = document.getElementById('form-file');
  globalFormFile.addEventListener('change', onFileChanged)
  globalButton = document.getElementById('button');

  globalButton.disabled = true;

  document.getElementById('form').addEventListener('submit', async event => {
    event.preventDefault();

    if (globalElmClicked) {
      return;
    }
    globalElmClicked = true;

    hideAlert();

    let formData = new FormData();

    globalFormFile.addEventListener('change', callbackGetFileSize);
    if (globalFormFile.files.length > 0) {
      formData.append('file', globalFormFile.files[0]);
    }

    serverAPI.importData({formData: formData, fileSize: globalFileSize}, ({data, error}) => {
      if (data) {
        console.log('TODO: Import data', data);
      } else {
        if(error) {
          showAlert(error);
        } else {
          showAlert('No data back');
        }
      }
      globalElmClicked = false;
    });

  });
}

