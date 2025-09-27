'use strict';

import showAlert, { EmptyField, EmptyGroup, hideAlert, showModal } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';
import { FORCE_SEARCH } from '../js/constants.mjs';

const PASSWD_LEN = Object.freeze(16);

let globalElmClicked = false;
let globalSession = null;
let globalField = null;

let globalFieldTitle = null;
let globalFieldValue = null;
let globalFieldIsHidden = null;

function onButtonGenerateRandomClick() {

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_-.?^~';
  let password = '';

  for (let i = 0; i < PASSWD_LEN; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  globalFieldValue.value = password;
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


function onButtonRightImage1Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;

  const fieldTitleElm = document.getElementById('field-title-elm');
  if(globalFieldTitle.value === '') {
    fieldTitleElm.classList.add('is-invalid');
    globalElmClicked = false;
    return;
  } else {
    fieldTitleElm.classList.remove('is-invalid');
  }

  showModal({
    title: globalField.id > 0 ? 'Update this element?' : 'Insert this element?',
    message: globalField.id > 0 ? 'Do you really want update this element?' : 'Do you really want insert this element?',
    close: 'No',
    confirm: 'Yes',
  }, confirm => {

    if(confirm) {
      const { group: currentGroup, search } = globalSession.stackNavigator.get();

      globalSession?.resetGuiCallbacks();

      globalField.group_id = currentGroup.id;
      globalField.server_group_id = currentGroup.server_id;
      globalField.title = globalFieldTitle.value;
      globalField.value = globalFieldValue.value;
      globalField.is_hidden = globalFieldIsHidden.checked;
      globalField.synchronized = false;

      serverAPI.data(`/field_detail/field/${globalField.id > 0 ? 'update' : 'insert'}`, {
        id: globalField.id,
        groupId: globalField.group_id,
        search: FORCE_SEARCH + globalField.title
      }, {
        fields: [globalField],
      }, ({ data, error }) => {
        if (data) {
          globalSession.loadSync(data);
        } else {
          showAlert(error);
        }
      });

    }
    globalElmClicked = false;
  });

}

export function onUpdateGui(session) {
  hideAlert();

  globalSession = session;

  if (!session?.lastData?.fields || session?.lastData?.fields.length === 0) {
    globalField = {
      ...EmptyField
    };
  } else {
    globalField = session?.lastData?.fields.at(0);
  }

  globalSession.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  globalSession.gui?.buttonRight0.classList.add('collapse');
  globalSession.setButtonRight0Callback('/images/ic_add.svg', onButtonRightImage1Click);


  globalFieldTitle = document.getElementById('field-title');
  if (globalField && globalField.title) {
    globalFieldTitle.value = globalField.title;
  }

  globalFieldValue = document.getElementById('field-value');
  if (globalField && globalField.value) {
    globalFieldValue.value = globalField.value;
  }

  globalFieldIsHidden = document.getElementById('field-is-hidden');
  if (globalFieldIsHidden && globalField.is_hidden) {
    globalFieldIsHidden.checked = globalField.is_hidden;
  }

  const generateRandom = document.getElementById('field-generate-random');
  generateRandom.addEventListener('click', onButtonGenerateRandomClick);

}