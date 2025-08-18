'use strict';

import showAlert, { EmptyGroup, EmptyGroupField, hideAlert, showModal } from '../js/pocket.mjs';
import serverAPI from '../js/serverAPI.mjs';

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

function resetMemory() {
  globalElmClicked = false;
  globalGroupField = null;

  globalGroupFields.clear();
  globalGroupFieldsNewIndex = 0;
}

function onFieldAddOrModify() {
  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  globalFieldTitleContainer.classList.remove('is-invalid');
  if(globalFieldTitle.value.trim() === '') {
    globalFieldTitleInvalid.text = 'This field is required';
    globalFieldTitleContainer.classList.add('is-invalid');
    globalElmClicked = false;
    return;
  }


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
      server_group_id: globalGroup?.server_id ?? 0,
      title: globalFieldTitle.value,
      is_hidden: globalFieldIsHidden.checked,
      synchronized: false
    };
  }


  const values = [...globalGroupFields.values()];
  for(const idx in values) {
    const groupField = values[idx];
    if (groupField.id !== localGroupField.id && groupField.title.toLowerCase() === localGroupField.title.toLowerCase()) {
      globalFieldTitleInvalid.innerHTML = 'Another field insert with same name';
      globalFieldTitleContainer.classList.add('is-invalid');
      globalElmClicked = false;
      return;
    }
  }

  globalGroupField = localGroupField;
  if(globalGroupField.id > 0 && globalGroupFields.has(globalGroupField.id)) {
    globalGroupFields.delete(globalGroupField.id);
  }
  globalGroupFields.set(globalGroupField.id, globalGroupField);

  let newGlobalGroupFields = [];

  globalGroupFields.forEach( (groupField, key) => {
    //console.log(key, groupField);
    newGlobalGroupFields.push(groupField);
  });

  globalFieldTitle.value = '';
  globalFieldIsHidden.checked = false;

  globalGroupField = null;
  updateRows({
    data: {
      group: globalGroup,
      group_fields: newGlobalGroupFields.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
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
      globalGroupFields.delete(globalGroupField.id);
    }

    let newGlobalGroupFields = [];

    globalGroupFields.forEach( (groupField, key) => {
      //console.log(key, groupField);
      newGlobalGroupFields.push(groupField);
    });


    globalFieldTitle.value = '';
    globalFieldIsHidden.checked = false;

    updateRows({
      data: {
        group: globalGroup,
        group_fields: newGlobalGroupFields.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
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
  globalSession?.resetGui();
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

  //group-title-elm
  const groupTitleElm = document.getElementById("group-title-elm");
  if(globalGroupTitle.value === '') {
    groupTitleElm.classList.add('is-invalid');
    globalElmClicked = false;
    return;
  } else {
    groupTitleElm.classList.remove('is-invalid');
  }

  showModal({
    title: globalGroup.server_id > 0 ? 'Update this element?' : 'Insert this element?',
    message: globalGroup.server_id > 0 ? 'Do you really want update this element?' : 'Do you really want insert this element?',
    close: 'No',
    confirm: 'Yes',
  }, (confirm) => {
    if(confirm) {

      const { group: currentGroup, search } = globalSession.getStackNavigator.get();
      globalSession?.resetGui();

      let newGlobalGroupFields = [];

      globalGroupFields.forEach( (groupField, _) => {
        if (!groupField.synchronized) {
          newGlobalGroupFields.push(groupField);
        }
      });

      const groupFields = newGlobalGroupFields.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));

      if (globalGroup.title !== globalGroupTitle.value) {
        globalGroup.title = globalGroupTitle.value;
        globalGroup.synchronized = false;
      }

      if (globalGroup.note !== globalGroupNote.value) {
        globalGroup.note = globalGroupNote.value;
        globalGroup.synchronized = false;
      }

      if(globalGroup.server_id > 0) {
        //update
        serverAPI.data(`/group_detail/group/update`, {
          id: globalGroup.id,
          groupId: globalGroup.group_id,
          search
        }, {
          groups: [globalGroup],
          groupFields
        }, ({ data, error }) => {
          if (data) {
            resetMemory();
            globalSession.loadSync(data);
          } else {
            showAlert(error);
          }
        });
      } else {
        //insert

        globalGroup.id = 0;
        globalGroup.group_id = currentGroup.id;
        if(currentGroup.server_id) {
          globalGroup.server_group_id = currentGroup.server_id;
        } else {
          globalGroup.server_group_id = 0;
        }
        globalGroup.has_child = false;

        serverAPI.data(`/group_detail/group/insert`, {
          id: globalGroup.id,
          groupId: currentGroup.group_id,
          search
        }, {
          groups: [globalGroup],
          groupFields
        }, ({ data, error }) => {
          if (data) {
            resetMemory();
            globalSession.loadSync(data);
          } else {
            showAlert(error);
          }
        });
      }
    }
    globalElmClicked = false;
  });

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

    globalElmClicked = false;

    const { group_fields: groupFields, insert } = data;

    if(insert) {
      resetMemory();
    }

    let table = '';
    try {
      if (groupFields) {
        let idx = 0;
        for (const groupField of groupFields) {
          if(groupField.deleted) {
            continue;
          }
          if(insert) {
            idx--;
            groupField.id = idx;
            groupField.server_id = 0;
            groupField.group_id = 0;
            groupField.server_group_id = 0;
            groupField.synchronized = false;
          }
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

  if (!session?.getLastData?.groups || session?.getLastData?.groups.length === 0) {
    globalGroup = {
      ...EmptyGroup
    };
  } else {
    globalGroup = session?.getLastData?.groups.at(0);
  }

  globalSession.getGui.title.innerHTML = globalGroup.title;

  globalSession.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  globalSession.getGui?.buttonRight0.classList.add('collapse');
  globalSession.setButtonRight0Callback('/images/ic_add_group.svg', onButtonRightImage1Click);


  globalGroupTitle = document.getElementById('group-title');
  if (globalGroup && globalGroup.title) {
    globalGroupTitle.value = globalGroup.title;
  }

  globalGroupNote = document.getElementById('group-note');
  if (globalGroup && globalGroup.note) {
    globalGroupNote.value = globalGroup.note;
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
