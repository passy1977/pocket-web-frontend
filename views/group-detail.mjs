'use strict';

import showAlert, { hideAlert, resetGuiCallbacks, showModal } from '../js/pocket.mjs';

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

let globalGroup = null;
const globalGroupFields = new Map();

function onFieldAdd(e) {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  console.log('onFieldAdd', e);
  globalElmClicked = false;
}

function onFieldClean(e) {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  showModal({
    title: 'Clean field data',
    message: `Do you want to clean all field data?`,
    close: 'No',
    confirm: 'Yes',
  }, (confirm) => {
    if(confirm) {
      globalFieldTitle.value = '';
      globalFieldIsHidden.checked = false;
    }
    globalElmClicked = false;
  });
}

function onEdit(e) {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  console.log('onEdit', e);
  globalElmClicked = false;
}

function onDelete(e) {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  console.log('onDelete', e);
  globalElmClicked = false;
}

function onButtonLeftImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  const data = globalSession.getStackNavigator.pop();
  if (data) {
    resetGuiCallbacks(onButtonLeftImage0Click);
    globalSession.loadSync({
      path: '/home',
      title: 'Home'
    }, false);
  } else {
    console.log('Todo open menu');
  }
  globalElmClicked = false;
}


function buildRow(ROW, {
  id,
  title
}) {
  if (typeof ROW !== 'string') {
    throw new TypeError(`ROW it's not a string`);
  }

  if (typeof id !== 'number') {
    throw new TypeError(`id it's not a number`);
  }

  if (typeof title !== 'string') {
    throw new TypeError(`title it's not a string`);
  }

  let row = ROW;
  row = row.replaceAll('{id}', id);
  row = row.replaceAll('{title}', title);
  return row;
}

function updateRows({ data, error }) {
  hideAlert();

  if (data) {
    globalDataContainer.innerHTML = '';

    globalGroupFields.clear();

    globalElmClicked = false;

    const { group_fields: groupFields } = data;

    let table = '';
    try {
      if (groupFields) {
        for (const groupField of groupFields) {
          globalGroupFields.set(groupField.id, groupField);
          table += buildRow(globalTemplateRow, groupField);
        }
      }
    } catch (e) {
      showAlert(error);
    }

    globalDataContainer.innerHTML = table;


    for (const { id, is_hidden: isHidden } of groupFields) {
      document.getElementById(`checkbox-${id}`).checked = isHidden;

      const edit = document.getElementById(`edit-${id}`);
      if (edit && !edit.onclick) {
        edit.addEventListener('click', onEdit);
      }

      const _delete = document.getElementById(`delete-${id}`);
      if (_delete && !_delete.onclick) {
        _delete.addEventListener('click', onDelete);
      }
    }

  } else if (error) {
    showAlert(error);
  } else {
    showAlert('unhandled error');
  }

}

export function onUpdateGui(session) {
  hideAlert();

  globalDataContainer = document.getElementById('data-container');
  if (!globalDataContainer) {
    throw new DOMException('data-container not found', 'home.mjs');
  }

  globalTemplateRow = globalDataContainer.innerHTML;
  globalDataContainer.innerHTML = '';

  globalSession = session;

  const { group, search } = session.getStackNavigator.get();

  globalElmClicked = false;

  session?.getGui?.buttonLeft0.classList.remove('collapse');
  session.getGui.title.innerHTML = group.title;
  session.getGui.buttonLeftImage0.src = '/images/ic_back.svg';
  if (!session?.getGui?.buttonLeftImage0.onclick) {
    session?.getGui?.buttonLeftImage0.addEventListener('click', onButtonLeftImage0Click);
  }

  session?.getGui?.buttonRight0.classList.add('collapse');
  session?.getGui?.buttonRight1.classList.add('collapse');

  globalGroupTitle = document.getElementById('group-title');
  if (group && group.title) {
    globalGroupTitle.value = group.title;
  }

  globalGroupNote = document.getElementById('group-note');
  if (group && group.note) {
    globalGroupNote.value = group.note;
  }

  globalFieldTitle = document.getElementById('field-title');
  globalFieldIsHidden = document.getElementById('field-is-hidden');

  const fieldAdd = document.getElementById('field-add');
  if (!fieldAdd.onclick) {
    fieldAdd.addEventListener('click', onFieldAdd);
  }

  const fieldClean = document.getElementById('field-clean');
  if (!fieldClean.onclick) {
    fieldClean.addEventListener('click', onFieldClean);
  }
}
