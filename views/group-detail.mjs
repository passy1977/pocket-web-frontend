'use strict';

import showAlert, { EmptyGroup, EmptyGroupField, hideAlert, resetGuiCallbacks, showModal } from '../js/pocket.mjs';

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
let globalFieldTitle = null
let globalFieldTitleContainer = null;
let globalFieldTitleInvalid = null;
let globalFieldIsHidden = null;

let globalGroup = null;
let globalGroupField = null;

let globalGroupFields = new Map();
let globalGroupFieldsNewIndex = 0;


function onFieldAddOrModify() {
  if (globalElmClicked) {
    return;
  }

  globalFieldTitleContainer.classList.remove('is-invalid');
  if(globalFieldTitle.value.trim() === '') {
    globalFieldTitleInvalid.text = 'This field is required';
    globalFieldTitleContainer.classList.add('is-invalid');
    return;
  }

  globalElmClicked = true;


  let localGroupField = null;
  if(globalGroupField) {
    localGroupField = {
      ...globalGroupField,
      title: globalFieldTitle.value,
      is_hidden: globalFieldIsHidden.checked,
      synchronized: false
    };
  } else {
    localGroupField = {
      ...EmptyGroupField,
      id: --globalGroupFieldsNewIndex,
      group_id: globalGroup?.id ?? 0,
      title: globalFieldTitle.value,
      is_hidden: globalFieldIsHidden.checked,
      synchronized: false
    };
  }


  const values = [...globalGroupFields.values()];
  for(const idx in values) {
    const groupField = values[idx];
    if (groupField.title.toLowerCase() === localGroupField.title.toLowerCase()) {
      globalFieldTitleInvalid.innerHTML = 'Another field insert with same name';
      globalFieldTitleContainer.classList.add('is-invalid');
      globalElmClicked = false;
      return;
    }
  }

  globalGroupField = localGroupField;
  globalGroupFields[globalGroupField.id] = globalGroupField;

  let newGlobalGroupFields = [];

  [...Object.values(globalGroupFields)]
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
    .forEach(groupField => newGlobalGroupFields.push(groupField));

  globalFieldTitle.value = '';
  globalFieldIsHidden.checked = false;

  updateRows({
    data: {
      group: globalGroup,
      group_fields: newGlobalGroupFields
    },
    error: null,
  });

  globalElmClicked = false;
}

function onFieldClean() {
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

  const elm = e.target;

  const id = parseInt(elm.getAttribute('data-type-id'));

  globalGroupField = globalGroupFields.get(id);

  globalFieldTitle.value = globalGroupField.title;
  globalFieldIsHidden.checked = globalGroupField.is_hidden;

  globalElmClicked = false;
}

function onDelete(e) {
  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;



  const elm = e.target;

  const id = parseInt(elm.getAttribute('data-type-id'));

  showModal({
    title: 'Delete field',
    message: `Do you really want to delete this element?`,
    close: 'No',
    confirm: 'Yes',
    data: { id }
  }, (confirm, { id, elm }) => {

    globalGroupField = globalGroupFields.get(id);

    if (globalGroupField.id > 0) {
      globalGroupField.synchronized = false;
      globalGroupField.deleted = true;
    } else {
      delete globalGroupFields[id];
    }

    let newGlobalGroupFields = [];

    [...Object.values(globalGroupFields)]
      .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
      .forEach(groupField => newGlobalGroupFields.push(groupField));

    globalFieldTitle.value = '';
    globalFieldIsHidden.checked = false;

    updateRows({
      data: {
        group: globalGroup,
        group_fields: newGlobalGroupFields
      },
      error: null,
    });

    globalElmClicked = false;

  });
}

function onButtonLeftImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  resetGuiCallbacks(onButtonLeftImage0Click);
  globalSession.loadSync({
    path: '/home',
    title: 'Home'
  }, false);
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
      const checkbox = document.getElementById(`checkbox-is-hidden-${id}`);
      if(checkbox) {
        checkbox.checked = isHidden;
      }


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
  globalElmClicked = false;
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

  if (session?.getLastData?.groups.length === 0) {
    globalGroup = {
      ...EmptyGroup
    };
  } else {
    globalGroup = session?.getLastData?.groups.at(0);
  }

  session?.getGui?.buttonLeft0.classList.remove('collapse');
  session.getGui.title.innerHTML = globalGroup.title;
  session.getGui.buttonLeftImage0.src = '/images/ic_back.svg';
  if (!session?.getGui?.buttonLeftImage0.onclick) {
    session?.getGui?.buttonLeftImage0.addEventListener('click', onButtonLeftImage0Click);
  }

  session?.getGui?.buttonRight0.classList.add('collapse');
  session?.getGui?.buttonRight1.classList.add('collapse');

  globalGroupTitle = document.getElementById('group-title');
  if (globalGroup && globalGroup.title) {
    globalGroupTitle.value = group.title;
  }

  globalGroupNote = document.getElementById('group-note');
  if (globalGroup && globalGroup.note) {
    globalGroupNote.value = group.note;
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

}
