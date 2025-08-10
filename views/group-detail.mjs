'use strict';

import showAlert, { hideAlert } from '../js/pocket.mjs';

const CollumType = Object.freeze({
  TITLE: 0,
  IS_HIDDEN: 1,
  ACTIONS: 2
});


let globalElmClicked = false;
let globalSession = null;
let globalDataContainer = null;
let globalTemplateRow = '';

let globalGroupTitle = null;
let globalGroupNote = null;
let globalFieldTitle = null;
let globalFieldIsHidden = null;


const globalGroupFields = new Map();


function buildRow(ROW, {
                    id,
                    title
                  }) {
  if(typeof ROW !== 'string') {
    throw new TypeError(`ROW it's not a string`);
  }

  if(typeof id !== 'number') {
    throw new TypeError(`id it's not a number`);
  }

  if(typeof title !== 'string') {
    throw new TypeError(`title it's not a string`);
  }

  let row = ROW;
  row = row.replaceAll('{id}', id);
  row = row.replaceAll('{title}', title);
  return row;
}

function onFieldAdd(e) {
  console.log('onFieldAdd', e);
}

function onFieldClean(e) {
  console.log('onFieldClean', e);
}

function onEdit(e) {
  console.log('onEdit', e);
}

function onDelete(e) {
  console.log('onDelete', e);
}

export function onUpdateGui(session) {
  hideAlert();

  globalDataContainer = Object.freeze(document.getElementById('data-container'));
  if(!globalDataContainer) {
    throw new DOMException('data-container not found', 'home.mjs');
  }

  globalTemplateRow = Object.freeze(globalDataContainer.innerHTML);

  globalSession = session;

  const {group, search} = session.getStackNavigator.get();

  globalElmClicked = false;

  session?.getGui?.buttonLeft0.classList.add('collapse');
  session?.getGui?.buttonRight0.classList.add('collapse');
  session?.getGui?.buttonRight1.classList.add('collapse');

  globalGroupTitle = document.getElementById('group-title');
  if(group && group.title) {
    globalGroupTitle.value = group.title;
  }

  globalGroupNote = document.getElementById('group-note');
  if(group && group.note) {
    globalGroupNote.value = group.note;
  }

  globalFieldTitle = document.getElementById('field-title');
  globalFieldIsHidden = document.getElementById('field-is-hidden');

  const fieldAdd = document.getElementById('field-add');
  if(!fieldAdd.onclick) {
    fieldAdd.addEventListener('click', onFieldAdd);
  }

  const fieldClean = document.getElementById('field-clean');
  if(!fieldClean.onclick) {
    fieldClean.addEventListener('click', onFieldClean);
  }

  updateRows({
    data: {
      group_fields: [{
        id: 1,
        title: 'test',
        is_hidden: true,
      }]
    }
  });
}


function updateRows({data, error}) {
  hideAlert();

  if(data) {
    globalDataContainer.innerHTML = '';

    globalGroupFields.clear();

    globalElmClicked = false;

    const {group_fields: groupFields} = data;

    let table = '';
    try {
      if(groupFields) {
        for (const groupField of groupFields) {
          globalGroupFields.set(groupField.id, groupField);
          table += buildRow(globalTemplateRow, groupField);
        }
      }
    } catch (e) {
      showAlert(error);
    }

    globalDataContainer.innerHTML = table;


    for (const {id, is_hidden: isHidden} of groupFields) {
      document.getElementById(`checkbox-${id}`).checked = isHidden;

      const edit = document.getElementById(`edit-${id}`);
      if(edit && !edit.onclick) {
        edit.addEventListener('click', onEdit);
      }

      const _delete = document.getElementById(`delete-${id}`);
      if(_delete && !_delete.onclick) {
        _delete.addEventListener('click', onDelete);
      }
    }

  } else if(error) {
    showAlert(error);
  } else {
    showAlert('unhandled error');
  }

}
