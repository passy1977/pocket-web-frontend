'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert, showModal } from '../js/pocket.mjs';

const FieldType = Object.freeze({
  GROUP: 0,
  FIELD: 1
});

let globalElmClicked = false;
let globalSession = null;
let globalDataContainer = null;
let globalTemplateRow = '';

let globalGroup = null;
let globalSearch = '';
const globalGroups = new Map();
const globalFields = new Map();

function onSearchElmKeyUp(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`event it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  globalSearch = e.target.value;

  serverAPI.home({
      groupId: globalGroup.id,
      search: globalSearch
    },
    updateRows);

}

function onCleanSearchClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`event it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  document.getElementById(`search`).value = '';
  globalSearch = '';

  serverAPI.home({
      groupId: globalGroup.id,
      search: globalSearch
    },
    updateRows);

  globalElmClicked = false;
}


function onToggleHidden(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  const id = parseInt(elm.getAttribute('data-type-id'));

  for (const fader of globalDataContainer.children) {
    for (const child of fader.children) {
      if (child?.getAttribute('data-field') === 'is-hidden' && parseInt(child?.getAttribute('data-type-id')) === id) {
        const field = globalFields.get(id);
        if (child.getAttribute('data-hidden') === 'true') {
          child.textContent = field.value.trim();
          child.setAttribute('data-hidden', 'false');
        } else {
          child.textContent = '*'.repeat(field.value.trim().length);
          child.setAttribute('data-hidden', 'true');
        }
      }
    }
  }
}

function onClickNote(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  const id = parseInt(elm.getAttribute('data-type-id'));
  const group = globalGroups.get(id);

  showModal({
    title: group.title,
    message: group.note,
    close: 'Close'
  }, () => {
    globalElmClicked = false;
  });

  globalElmClicked = true;
}

function onClickDelete(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  const id = parseInt(elm.getAttribute('data-type-id'));
  const type = elm.getAttribute('data-type');
  showModal({
    title: 'Delete group',
    message: `Do you really want to delete <i>${(type === 'group' ? globalGroups : globalFields).get(id).title}</i> ${(type === 'group' ? 'group' : 'field')} and all depenencies?`,
    close: 'No',
    confirm: 'Yes',
    data: { id, type }
  }, (confirm, { id, type }) => {
    if (confirm) {
      if (type === 'group') {
        const group = globalGroups?.get(id);
        group.synchronized = false;
        group.deleted = true;

        const { id: _id, group_id: groupId } = group;

        serverAPI.data('/home/group/delete', {
          id: _id,
          groupId,
          search: globalSearch
        }, { groups: [group] }, updateRows);

      } else if (type === 'field') {
        const field = globalFields?.get(id);
        field.synchronized = false;
        field.deleted = true;

        const { _id, group_id: groupId } = field;

        serverAPI.data('/home/field/delete', {
          id: _id,
          groupId,
          search: globalSearch
        }, { fields: [field] }, updateRows);
      }
    }
    globalElmClicked = false;
  });
}

function onClickEdit(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  const id = parseInt(elm.getAttribute('data-type-id'));
  const type = elm.getAttribute('data-type');
  showModal({
    title: 'Edit Group',
    message: `Do you really want to edit <i>${(type === 'group' ? globalGroups : globalFields).get(id).title}</i>`,
    close: 'No',
    confirm: 'Yes',
    data: { id, type }
  }, (confirm, { id, type }) => {
    if (confirm) {
      globalSession?.resetGui();
      if (type === 'group') {

        const {id: _id, group_id: groupId} = globalGroups?.get(id);

        serverAPI.groupDetail(
          {
            id: _id,
            groupId
          },
          ({ data, error }) => {
            if (data) {
              globalSession.loadSync(data);
            } else {
              if (error) {
                showAlert(error);
              } else {
                showAlert('unhandled error');
              }
            }
          });

      } else if (type === 'field') {
        const {id: _id, group_id: groupId} = globalFields?.get(id);

        console.log(`TODO: edit field id:${ _id }, group_id:${ groupId }`);

      }
    }
    globalElmClicked = false;
  });
}

async function onClickCopy(elm) {
  const id = parseInt(elm.getAttribute('data-type-id'));
  try {
    await navigator.clipboard.writeText(globalFields?.get(id).value);
  } catch (err) {
    console.error(err);
  }
}

function onButtonLeftImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  const data = globalSession.getStackNavigator.pop();
  if (data) {
    globalSession.loadSync({
      path: '/home',
      title: 'Home'
    }, false);
  } else {
    console.log('TODO: open menu');
  }
  globalElmClicked = false;
}

function onButtonRightImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  console.log('TODO: new field');
  //resetGuiCallbacks();
  globalElmClicked = false;
}

function onButtonRightImage1Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;

  globalSession?.resetGui();

  serverAPI.groupDetail(
    {
      id: 0,
      groupId: globalGroup.id,
      group: globalGroup
    },
    ({ data, error }) => {
      if (data) {
        globalSession.loadSync(data);
      } else {
        if (error) {
          showAlert(error);
        } else {
          showAlert('unhandled error');
        }
      }
    });

  globalElmClicked = false;
}

function buildRow(ROW, type, {
  id,
  title,
  value,
  note,
  is_hidden: isHidden,
  has_child: hasChild
}) {
  if (typeof ROW !== 'string') {
    throw new TypeError(`ROW it's not a string`);
  }

  if (typeof type !== 'number') {
    throw new TypeError(`type it's not a number`);
  }

  if (typeof id !== 'number') {
    throw new TypeError(`id it's not a number`);
  }

  if (typeof title !== 'string') {
    throw new TypeError(`title it's not a string`);
  }

  if (type === FieldType.FIELD && typeof value !== 'string') {
    throw new TypeError(`value it's not a string`);
  }

  if (type === FieldType.GROUP && typeof note !== 'string') {
    throw new TypeError(`note it's not a string`);
  }

  if (type === FieldType.GROUP && typeof hasChild !== 'boolean') {
    throw new TypeError(`hasChild it's not a boolean`);
  }

  if (type === FieldType.FIELD && typeof isHidden !== 'boolean') {
    throw new TypeError(`isHidden it's not a boolean`);
  }

  let row = ROW.replaceAll('{type}', type === FieldType.GROUP ? 'group' : 'field');
  row = row.replaceAll('{id}', id);
  row = row.replaceAll('{icon}', type === FieldType.GROUP ? '/images/ic_group.svg' : '/images/ic_field.svg');
  row = row.replaceAll('{icon-alt}', type === FieldType.GROUP ? 'Group icon' : 'Field icon');
  row = row.replaceAll('{title}', title);

  if (note) {
    row = row.replaceAll('<!--note', '');
    row = row.replaceAll('{note-alt}', note.replaceAll('"', '\"'));
    row = row.replaceAll('{note}', note);
    row = row.replaceAll('note-->', '');
  } else {
    row = row.replaceAll('{note}', '');
    row = row.replaceAll('{note-alt}', '');
  }

  if (isHidden) {
    row = row.replaceAll('<!--is-hidden', '');
    row = row.replaceAll('{is-hidden}', value);
    row = row.replaceAll('is-hidden-->', '');
  } else {
    row = row.replaceAll('{is-hidden}', '');
  }

  if (type === FieldType.GROUP && !hasChild) {
    row = row.replaceAll('{no-child}', 'no-child');
  } else {
    row = row.replaceAll('{no-child}', '');
  }

  return row;
}

function onClick(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  const id = parseInt(elm.getAttribute('data-type-id'));
  const type = elm.getAttribute('data-type');

  switch (type) {
    case 'group':
      if (globalSession && globalGroups.has(id)) {
        globalSession.getStackNavigator.push(globalGroups.get(id), globalSearch);
        globalSession.loadSync({
          path: '/home',
          title: 'Home'
        }, false);
      }
      break;
    case 'field':
      const elm = document.getElementById(`is-hidden-field-${id}`);
      if (elm) {
        onToggleHidden(elm);
      }
      break;

  }
}


function updateRows({ data, error }) {
  hideAlert();
  if (data) {
    globalDataContainer.innerHTML = '';

    globalGroups.clear();
    globalFields.clear();
    globalElmClicked = false;

    const { groups, fields } = data;

    if(groups.length === 0 && fields.length === 0) {
      globalDataContainer.innerHTML = '';
      return;
    }

    let table = '';
    try {
      if (groups) {
        for (const group of groups) {
          globalGroups.set(group.id, group);
          table += buildRow(globalTemplateRow, FieldType.GROUP, group);
        }
      }

      if (fields) {
        for (const field of fields) {
          globalFields.set(field.id, field);
          table += buildRow(globalTemplateRow, FieldType.FIELD, field);
        }
      }

    } catch (e) {
      showAlert(error);
    }

    globalDataContainer.innerHTML = table;

    for (const fader of globalDataContainer.children) {
      for (const child of fader.children) {
        switch (child.getAttribute('data-field')) {
          case 'is-hidden':
            child.setAttribute('data-hidden', 'true');
            const textContent = child.textContent.trim();
            child.textContent = '*'.repeat(textContent.length);

            child.addEventListener('click', () => onToggleHidden(child));
            break;
          case 'buttons':
            for (const img of child.children) {
              switch (img.getAttribute('data-field')) {
                case 'note':
                  img.addEventListener('click', () => onClickNote(child));
                  break;
                case 'delete':
                  img.addEventListener('click', () => onClickDelete(img));
                  break;
                case 'edit':
                  img.addEventListener('click', () => onClickEdit(img));
                  break;
                case 'copy':
                  if (child.getAttribute('data-type') === 'group') {
                    img.classList.add('collapse');
                  } else {
                    img.addEventListener('click', () => onClickCopy(img));
                  }
                  break;
              }
            }
            break;
          default:
            child.addEventListener('click', () => onClick(child));
            break;
        }
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

  const { group: currentGroup, search } = session.getStackNavigator.get();
  globalGroup = currentGroup;
  globalSearch = search;

  globalElmClicked = false;

  if (globalSession.getStackNavigator.getIndex > 0) {
    document.title = `Pocket 5 - ${ globalGroup.title }`;
    globalSession.getGui.title.innerHTML = globalGroup.title;
  } else {
    document.title = `Pocket 5 - Home`;
    globalSession.getGui.title.innerHTML = 'Home';
  }


  if (globalSession.getStackNavigator.getIndex > 0) {
    globalSession.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  } else {
    globalSession.getGui?.buttonLeft0.classList.remove('collapse');
    globalSession.getGui.buttonLeftImage0.src = '/images/ic_menu.svg';
  }

  globalSession.setButtonRight0Callback('/images/ic_add_field.svg', onButtonRightImage0Click);
  globalSession.setButtonRight1Callback('/images/ic_add_group.svg', onButtonRightImage1Click);

  const searchElm = document.getElementById(`search`);
  searchElm.textContent = globalSearch;
  if (!searchElm.onkeyup) {
    searchElm.addEventListener('keyup', onSearchElmKeyUp);
  }

  const cleanSearchElm = document.getElementById(`clean-search`);
  if (!cleanSearchElm.onkeyup) {
    cleanSearchElm.addEventListener('click', onCleanSearchClick);
  }

  serverAPI.home({
      groupId: globalGroup.id,
      search: globalSearch
    },
    updateRows);
}
