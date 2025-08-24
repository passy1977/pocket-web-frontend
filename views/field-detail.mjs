'use strict';

import { EmptyField, EmptyGroup, hideAlert } from '../js/pocket.mjs';

let globalElmClicked = false;
let globalSession = null;
let globalField = null;

let globalGroupTitle = null;

export function onUpdateGui(session) {
  hideAlert();

  globalSession = session;

  if (!session?.getLastData?.fields || session?.getLastData?.fields.length === 0) {
    globalField = {
      ...EmptyField
    };
  } else {
    globalField = session?.getLastData?.fields.at(0);
  }

  globalSession.getGui.title.innerHTML = globalField.title;

  globalSession.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  globalSession.getGui?.buttonRight0.classList.add('collapse');
  globalSession.setButtonRight0Callback('/images/ic_add.svg', onButtonRightImage1Click);


  globalGroupTitle = document.getElementById('group-title');
  if (globalField && globalField.title) {
    globalGroupTitle.value = globalField.title;
  }

  globalGroupNote = document.getElementById('group-note');
  if (globalField && globalField.note) {
    globalGroupNote.value = globalField.note;
  }

  globalFieldTitle = document.getElementById('field-title');
  globalFieldTitleContainer = document.getElementById('field-title-container');
  globalFieldTitleInvalid = document.getElementById('field-title-invalid');
  globalFieldIsHidden = document.getElementById('field-is-hidden');

  const fieldAdd = document.getElementById('field-add');
  fieldAdd.removeEventListener('click', onFieldAddOrModify);
  fieldAdd.addEventListener('click', onFieldAddOrModify);


  const fieldClean = document.getElementById('field-clean');
  fieldClean.removeEventListener('click', onFieldClean);
  fieldClean.addEventListener('click', onFieldClean);


  updateRows({data: session?.getLastData, error: null});
}