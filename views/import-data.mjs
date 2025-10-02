'use strict';

import showAlert, { hideAlert, sanitize, setBackHandler } from '../js/pocket.mjs';
import serverAPI from '../js/server-api.mjs';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '../js/constants.mjs';

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

  setBackHandler(onButtonLeftImage0Click);

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

    globalFormFile.removeEventListener('change', callbackGetFileSize);
    globalFormFile.addEventListener('change', callbackGetFileSize);
    if (globalFormFile.files.length > 0) {
      const file = globalFormFile.files[0];
      const sanitizedFileName = sanitize(file.name, true);

      if (file.size > MAX_FILE_SIZE) {
        showAlert('File troppo grande');
        globalElmClicked = false;
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        showAlert('Tipo file non supportato');
        globalElmClicked = false;
        return;
      }

      formData.append('file', file);
      if(sanitizedFileName.includes(".xml")) {
        formData.append('file_legacy', 1);
      } else {
        formData.append('file_legacy', 0);
      }
    }



    serverAPI.importData({formData: formData, fileSize: globalFileSize}, ({data, error}) => {
      if (data) {
        globalSession.loadSync(data);
      } else {
        if(error) {
          showAlert('Error during data import');
          console.error('Import error:', error);
        } else {
          showAlert('No data back');
        }
      }
      globalElmClicked = false;
    });

  });
}

