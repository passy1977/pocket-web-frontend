'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert, showModal } from '../js/pocket.mjs';
import { FORCE_SEARCH } from '../js/constants.mjs';

const FieldType = Object.freeze({
  GROUP: 0,
  FIELD: 1
});

let globalElmClicked = false;
let globalSession = null;
let globalDataContainer = null;
let globalTemplateRow = '';
let globalSideMenu = null;

let globalGroup = null;
let globalSearch = '';
const globalGroups = new Map();
const globalFields = new Map();


function onImportDataClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;


  globalSession?.resetGuiCallbacks();
  globalSideMenu.classList.remove('open');
  hideAlert();
  try {
    serverAPI.importData({formData: null, fileSize: null}, ({data, error}) => {
      if (data) {
        globalSession.loadSync(data);
      } else {
        if (error) {
          showAlert(error);
        } else {
          showAlert('unhandled error');
        }
      }
      globalElmClicked = false;
    });
  } catch (e) {
    showAlert(e);
  }
}

function onExportDataClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();
  globalSideMenu.classList.remove('open');
  hideAlert();
  try {
    serverAPI.exportData(null, ({ data, error }) => {
      if (data) {
        globalSession.loadSync(data);
      } else {
        if (error) {
          showAlert(error);
        } else {
          showAlert('unhandled error');
        }
      }
      globalElmClicked = false;
    });
  } catch (e) {
    showAlert(e);
  }
}

function onChangePasswdClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();
  globalSideMenu.classList.remove('open');
  hideAlert();
  try {
    serverAPI.changePasswd({passwd: null, newPasswd: null}, ({ data, error }) => {
      if (data) {
        globalSession.loadSync(data);
      } else {
        if (error) {
          showAlert(error);
        } else {
          showAlert('unhandled error');
        }
      }
      globalElmClicked = false;
    });
  } catch (e) {
    showAlert(e);
  }
}

function onDeleteSessionClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();
  globalSideMenu.classList.remove('open');
  hideAlert();
  showModal({
    title: 'Delete session',
    message: `This action will delete all data and the configuration file, you will have to re-register your account`,
    close: 'No',
    confirm: 'Yes'
  }, (confirm) => {
    if (confirm) {

      try {
        const { group: currentGroup, search } = globalSession.stackNavigator.get();

        serverAPI.logout({groupId: currentGroup.id, search, maintainConfig: false}, ({ data, error }) => {
          if (data) {
            globalSession.loadSync(data);
          } else {
            if (error) {
              showAlert(error);
            } else {
              showAlert('unhandled error');
            }
          }
          globalElmClicked = false;
        });
      } catch (e) {
        showAlert(e);
      }

    }
    globalElmClicked = false;
  });
}

function onLogoutClick(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }

  if (globalElmClicked) {
    return;
  }

  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();
  globalSideMenu.classList.remove('open');
  hideAlert();
  try {
    const { group: currentGroup, search } = globalSession.stackNavigator.get();

    serverAPI.logout({groupId: currentGroup.id, search, maintainConfig: true}, ({ data, error }) => {
      if (data) {
        globalSession.loadSync(data);
        serverAPI.invalidate();
        serverAPI.hello(({ data, error }) => {
          if (!data) {
            if (error) {
              showAlert(error);
            } else {
              showAlert('unhandled error');
            }
          }
        });
      } else {
        if (error) {
          showAlert(error);
        } else {
          showAlert('unhandled error');
        }
      }
      globalElmClicked = false;
    });
  } catch (e) {
    showAlert(e);
  }
}

function onSearchElmKeyUp(e) {
  if (typeof e !== 'object') {
    throw new TypeError(`event it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  globalSearch = e.target.value;

  try {
    globalSession.stackNavigator.get().search = globalSearch;
    serverAPI.home({
        groupId: globalGroup.id,
        search: globalSearch
      },
      updateRows);
  } catch (e) {
    showAlert(e);
  }
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

  try {
    serverAPI.home({
        groupId: globalGroup.id,
        search: globalSearch
      },
      updateRows);
  } catch (e) {
    showAlert(e);
  }
  globalElmClicked = false;
}


function onToggleHidden(elm) {
  if (typeof elm !== 'object') {
    throw new TypeError(`elm it's not a object`);
  }
  if (globalElmClicked) {
    return;
  }

  const dataHidden = elm.getAttribute('data-hidden');
  if (dataHidden && dataHidden === 'true') {
    elm.classList.toggle('hidden-text');
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
        try {
          serverAPI.data('/home/group/delete', {
            id: _id,
            groupId,
            search: globalSearch
          }, { groups: [group] }, updateRows);
        } catch (e) {
          showAlert(e);
        }
      } else if (type === 'field') {
        const field = globalFields?.get(id);
        field.synchronized = false;
        field.deleted = true;

        const { _id, group_id: groupId } = field;

        try {
          serverAPI.data('/home/field/delete', {
            id: _id,
            groupId,
            search: globalSearch
          }, { fields: [field] }, updateRows);
        } catch (e) {
          showAlert(e);
        }
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
      globalSession?.resetGuiCallbacks();
      if (type === 'group') {

        const { id: _id, group_id: groupId } = globalGroups?.get(id);

        try {
          serverAPI.groupDetail({
            id: _id,
            groupId
          }, ({ data, error }) => {
            if (data) {
              globalSideMenu.classList.remove('open');

              data['insert'] = false;
              globalSession.loadSync(data);
            } else {
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
      } else if (type === 'field') {

        const { id: _id, group_id: groupId } = globalFields?.get(id);
        try {
          serverAPI.fieldDetail({
            id: _id,
            groupId
          }, ({ data, error }) => {
            if (data) {
              globalSideMenu.classList.remove('open');

              data['insert'] = false;
              globalSession.loadSync(data);
            } else {
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
    }
    globalElmClicked = false;
  });
}

async function onClickCopy(elm) {
  const id = parseInt(elm.getAttribute('data-type-id'));
  try {
    await navigator.clipboard.writeText(globalFields?.get(id).value);
    showModal({ title: 'Message', message: 'value copied to clipboard' });
  } catch (err) {
    showAlert(err);
  }
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
        globalSideMenu.classList.remove('open');

        globalSession.stackNavigator.push(globalGroups.get(id));
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

function onButtonLeftImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;
  const data = globalSession.stackNavigator.pop();
  if (data) {
    globalSideMenu.classList.remove('open');
    globalSession.loadSync({
      path: '/home',
      title: 'Home'
    }, false);
  } else {
    globalSideMenu.classList.toggle('open');
  }
  globalElmClicked = false;
}

function onButtonRightImage0Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();

  try {
    serverAPI.fieldDetail({
      id: 0,
      groupId: globalGroup.id,
      group: globalGroup
    }, ({ data, error }) => {
      if (data) {
        globalSideMenu.classList.remove('open');

        data['insert'] = true;
        globalSession.loadSync(data);
      } else {
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
  globalElmClicked = false;
}

function onButtonRightImage1Click() {
  if (globalElmClicked) {
    return;
  }
  globalElmClicked = true;

  globalSession?.resetGuiCallbacks();

  try {
    serverAPI.groupDetail({
      id: 0,
      groupId: globalGroup.id
    }, ({ data, error }) => {
      if (data) {
        globalSideMenu.classList.remove('open');

        data['insert'] = true;
        globalSession.loadSync(data);
      } else {
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

  if(isHidden !== undefined) {
    row = row.replaceAll('<!--is-hidden', '');
    if(value.startsWith('http://') || value.startsWith('https://')) {
      row = row.replaceAll('{is-hidden}', `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`);
    } else {
      row = row.replaceAll('{is-hidden}', value);
    }

    if (isHidden) {
      row = row.replaceAll('{is-hidden-class}', 'hidden-text');
    } else {
      row = row.replaceAll('{is-hidden-class}', '');
    }
    row = row.replaceAll('is-hidden-->', '');
  }
  else
  {
    row = row.replaceAll('{is-hidden}', '');
    row = row.replaceAll('{is-hidden-class}', '');
  }

  if (type === FieldType.GROUP && !hasChild) {
    row = row.replaceAll('{no-child}', 'no-child');
  } else {
    row = row.replaceAll('{no-child}', '');
  }

  return row;
}

function updateRows({ data, error }) {
  hideAlert();
  if (data) {
    globalDataContainer.innerText = '';

    globalGroups.clear();
    globalFields.clear();
    globalElmClicked = false;

    let { groups, fields } = data;

    if(!groups) {
      groups = [];
    }

    if(!fields) {
      fields = [];
    }

    if (groups.length === 0 && fields.length === 0) {
      const container = document.createElement('div');
      container.className = 'd-flex justify-content-center align-items-center mt-1 mb-1';
      container.append(document.createTextNode(' No data available'));
      globalDataContainer.appendChild(container);
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
      return;
    }

    globalDataContainer.innerHTML = table;

    for (const fader of globalDataContainer.children) {
      for (const child of fader.children) {
        switch (child.getAttribute('data-field')) {
          case 'is-hidden':
            const id = parseInt(child.getAttribute('data-type-id'));

            const {is_hidden: isHidden} = globalFields.get(id);

            child.setAttribute('data-hidden', `${isHidden}`);
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

  globalSideMenu = document.getElementById('side-menu');
  document.getElementById('import-data')?.addEventListener('click', onImportDataClick);
  document.getElementById('export-data')?.addEventListener('click', onExportDataClick);
  document.getElementById('change-passwd')?.addEventListener('click', onChangePasswdClick);
  document.getElementById('delete-session')?.addEventListener('click', onDeleteSessionClick);
  document.getElementById('logout')?.addEventListener('click', onLogoutClick);
  globalDataContainer = document.getElementById('data-container');

  if (!globalDataContainer) {
    throw new DOMException('data-container not found', 'home.mjs');
  }
  globalTemplateRow = globalDataContainer.innerHTML;
  globalDataContainer.innerHTML = '';

  globalSession = session;

  const { group: currentGroup, search } = session.stackNavigator.get();
  globalGroup = currentGroup;
  if(!session.lastData.data?.startsWith(FORCE_SEARCH)) {
    globalSearch = search;
  } else {
    globalSearch = session.lastData.data?.slice(FORCE_SEARCH.length);
  }

  if(globalGroup.note && globalGroup.note !== '') {
    document.getElementById('note').textContent = globalGroup.note;
    document.getElementById('note-container').classList.remove('collapse');
  }

  globalElmClicked = false;

  if (globalSession.stackNavigator.index > 0) {
    document.title = `Pocket 5 - ${globalGroup.title}`;
    globalSession.gui.title.innerText = globalGroup.title;
  } else {
    document.title = `Pocket 5 - Home`;
    globalSession.gui.title.innerText = 'Home';
  }


  if (globalSession.stackNavigator.index > 0) {
    globalSession.setButtonLeft0Callback('/images/ic_back.svg', onButtonLeftImage0Click);
  } else {
    globalSession.setButtonLeft0Callback('/images/ic_menu.svg', onButtonLeftImage0Click);
  }

  globalSession.setButtonRight0Callback('/images/ic_add_field.svg', onButtonRightImage0Click);
  globalSession.setButtonRight1Callback('/images/ic_add_group.svg', onButtonRightImage1Click);

  const searchElm = document.getElementById(`search`);
  searchElm.value = globalSearch;
  if (!searchElm.onkeyup) {
    searchElm.addEventListener('keyup', onSearchElmKeyUp);
  }

  const cleanSearchElm = document.getElementById(`clean-search`);
  if (!cleanSearchElm.onkeyup) {
    cleanSearchElm.addEventListener('click', onCleanSearchClick);
  }

  try {
    serverAPI.home({
        groupId: globalGroup.id,
        search: globalSearch
      },
      updateRows);
  } catch (e) {
    showAlert(e);
  }
}
