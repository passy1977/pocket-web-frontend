'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert } from '../js/pocket.mjs';
import { GroupStacked } from '../js/session.mjs';

const FieldType = Object.freeze({
    GROUP: 0,
    FIELD: 1
});

let toastOpen = false;
const dataGroups = new Map();
const dataFields = new Map();
let globalSession = null;

function buildRow(ROW, type, {
    id,
    title,
    note,
    is_hidden: isHidden,
    has_child: hasChild
}) {
    if(typeof ROW !== 'string') {
        throw new TypeError(`ROW it's not a string`);
    }

    if(typeof type !== 'number') {
        throw new TypeError(`type it's not a number`);
    }

    if(typeof id !== 'number') {
        throw new TypeError(`id it's not a number`);
    }

    if(typeof title !== 'string') {
        throw new TypeError(`title it's not a string`);
    }

    if(note === FieldType.GROUP && typeof note !== 'string') {
        throw new TypeError(`note it's not a string`);
    }

    if(hasChild === FieldType.GROUP && typeof hasChild !== 'boolean') {
        throw new TypeError(`hasChild it's not a boolean`);
    }

    if(type === FieldType.FIELD && typeof isHidden !== 'boolean') {
        throw new TypeError(`isHidden it's not a boolean`);
    }

    let row = ROW.replaceAll('{type}', type === FieldType.GROUP ? 'group' : 'field');
    row = row.replaceAll('{id}', id);
    row = row.replaceAll('{icon}', type === FieldType.GROUP ? 'images/ic_group.svg' : 'images/ic_field.svg');
    row = row.replaceAll('{icon-alt}', type === FieldType.GROUP ? 'Group icon' : 'Field icon');
    row = row.replaceAll('{title}', title);

    if(note) {
        row = row.replaceAll('<!--note', '');
        row = row.replaceAll('{note-alt}', note.replaceAll('"', '\"'));
        row = row.replaceAll('{note}', note);
        row = row.replaceAll('note-->', '')
    } else {
        row = row.replaceAll('{note}', '');
    }

    if(isHidden) {
        row = row.replaceAll('<!--is-hidden', '');
        row = row.replaceAll('{is-hidden}', passwd);
        row = row.replaceAll('is-hidden-->', '')
    } else {
        row = row.replaceAll('{is-hidden}', '');
    }

    if(!hasChild) {
        row = row.replaceAll('{no-child}', 'no-child');
    } else {
        row = row.replaceAll('{no-child}', '');
    }

    row = row.replaceAll('{buttons}', 'TODO');

    return row;
}

function onClick(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(toastOpen) {
        return;
    }

    const search = document.getElementById(`search`);
    const id = elm.getAttribute('data-type-id');
    const type = elm.getAttribute('data-type');

    switch (type) {
        case 'group':
            const idInt = parseInt(id);
            if(globalSession && dataGroups.has(idInt)) {
                globalSession.getNavigator.stack.push(
                  new GroupStacked(dataGroups.get(idInt), search.textContent)
                );
                globalSession.getNavigator.index++;
                globalSession.loadSync({
                    path: '/home',
                    title: 'Home',
                });
            }
            break;
        case 'field':
            console.log(`field-${id}`);
            break;

    }
    console.log('click', elm);
}

function onTogglePasswd(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(toastOpen) {
        return;
    }

    console.log('togglePasswd', elm);
}

function onClickNote(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(toastOpen) {
        return;
    }

    const id = elm.getAttribute('data-type-id');
    const toastEl = document.getElementById(`note-${id}`);
    toastEl.addEventListener('hidden.bs.toast', function () {
        toastOpen = false;
    })
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);

    toast.show();
    toastOpen = true;
}

export function onUpdateGui(session) {
    hideAlert();

    globalSession = session;

    session?.getGui?.buttonLeft0.classList.remove('collapse');
    const buttonLeftImage0 = session?.getGui?.buttonLeftImage0;
    buttonLeftImage0.src = '/images/ic_menu.svg';
    buttonLeftImage0.addEventListener('click', () =>
      console.log("buttonLeftImage0")
    );

    session?.getGui?.buttonRight0.classList.remove('collapse');
    const buttonRightImage0 = session?.getGui?.buttonRightImage0;
    buttonRightImage0.classList.remove('collapse');
    buttonRightImage0.src = '/images/ic_add_field.svg';
    buttonRightImage0.addEventListener('click', () =>
      console.log("buttonRightImage0")
    );

    session?.getGui?.buttonRight1.classList.remove('collapse');
    const buttonRightImage1 = session?.getGui?.buttonRightImage1;
    buttonRightImage1.classList.remove('collapse');
    buttonRightImage1.src = '/images/ic_add_group.svg';
    buttonRightImage1.addEventListener('click', () =>
      console.log("buttonRightImage1")
    );


    const dataContainer = document.getElementById('data-container');
    if(!dataContainer) {
        throw new DOMException('data-container not found', 'home.mjs');
    }
    const ROW = dataContainer.innerHTML;

    const nav = session.getNavigator.stack[session.getNavigator.index];

    if(session.getNavigator.index > 0) {
        document.title = nav.getGroup().title;
        session.getGui.title.innerHTML = nav.getGroup().title;
    }

    serverAPI.home({
        groupId: nav.getGroup().id,
        search: nav.getSearch(),
    }, ({data, error}) => {
        hideAlert();
        if(data) {
            dataGroups.clear();
            dataFields.clear();

            const {groups, fields} = data;

            let table = '';
            if(groups) {
                for (const group of groups) {
                    dataGroups.set(group.id, group);
                    table += buildRow(ROW, FieldType.GROUP, group);
                }
            }

            if(fields) {
                for (const field of fields) {
                    dataFields.set(field.id, field);
                    table += buildRow(ROW, FieldType.FIELD, field);
                }
            }

            dataContainer.innerHTML = table;

            for (const fader of dataContainer.children) {
                for (const child of fader.children) {
                    switch (child.getAttribute('data-field')) {
                        case 'passwd': {
                            child.setAttribute('data-hidden', true);
                            const textContent = child.textContent.trim();
                            child.textContent = '*'.repeat(textContent.length);

                            child.addEventListener('click', () => onTogglePasswd(child));
                            break;
                        }
                        case 'note': {
                            child.addEventListener('click', () => onClickNote(child));
                            break;
                        }
                        default: {
                            child.addEventListener('click', () => onClick(child));
                            break;
                        }
                    }
                }
            }
        } else if(error) {
            showAlert(error);
        } else {
            showAlert('unhandled error');
        }
    });



}
