'use strict';

import serverAPI from '../js/serverAPI.mjs';
import showAlert, { hideAlert, showModal } from '../js/pocket.mjs';

const FieldType = Object.freeze({
    GROUP: 0,
    FIELD: 1
});

let elmClicked = false;
const globalGroups = new Map();
const globalFields = new Map();
let globalSession = null;

function buildRow(ROW, type, {
    id,
    title,
    value,
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

    if(type === FieldType.FIELD && typeof value !== 'string') {
        throw new TypeError(`value it's not a string`);
    }

    if(type === FieldType.GROUP && typeof note !== 'string') {
        throw new TypeError(`note it's not a string`);
    }

    if(type === FieldType.GROUP && typeof hasChild !== 'boolean') {
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
        row = row.replaceAll('{is-hidden}', value);
        row = row.replaceAll('is-hidden-->', '')
    } else {
        row = row.replaceAll('{is-hidden}', '');
    }

    if(type === FieldType.GROUP && !hasChild) {
        row = row.replaceAll('{no-child}', 'no-child');
    } else {
        row = row.replaceAll('{no-child}', '');
    }

    return row;
}

function onClick(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(elmClicked) {
        return;
    }

    const id = parseInt(elm.getAttribute('data-type-id'));
    const type = elm.getAttribute('data-type');

    switch (type) {
        case 'group':
            if(globalSession && globalGroups.has(id)) {
                globalSession.getStackNavigator.push(globalGroups.get(id),  document.getElementById(`search`)?.textContent);
                globalSession.loadSync({
                    path: '/home',
                    title: 'Home',
                });
            }
            break;
        case 'field':
            const elm = document.getElementById(`is-hidden-field-${id}`);
            if(elm) {
                onToggleHidden(elm);
            }
            break;

    }
    console.log('click', elm);
}

function onToggleHidden(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(elmClicked) {
        return;
    }

    const id = parseInt(elm.getAttribute('data-type-id'));

    const dataContainer = document.getElementById('data-container');
    for (const fader of dataContainer.children) {
        for (const child of fader.children) {
            if(child?.getAttribute('data-field') === 'is-hidden' && parseInt(child?.getAttribute('data-type-id')) === id) {
                const field = globalFields.get(id);
                if(child.getAttribute('data-hidden') === 'true') {
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
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }
    if(elmClicked) {
        return;
    }

    const id = parseInt(elm.getAttribute('data-type-id'));
    const group = globalGroups.get(id);

    showModal({
        title: group.title,
        message: group.note,
        close: 'Close',
    }, () => {
        elmClicked = false;
    });

    elmClicked = true;
}

function onClickDelete(elm) {
    const id = parseInt(elm.getAttribute('data-type-id'));
    const dataType = elm.getAttribute('data-type');
    if(dataType === 'group') {
        showModal({
            title: 'Delete group',
            message: `Do you really want to delete <i>${globalGroups.get(id).title}</i> group and all depenencies?`,
            close: 'No',
            confirm: 'Yes',
        }, (confirm) => {
            if (confirm) {
                const group = globalGroups?.get(id);
                group.synchronized = false;
                group.deleted = true;

                // serverAPI.da({
                //       groupId: group.id,
                //       search,
                //   },
                //   updateRows);
            };
        })

    } else {
        showModal({
            title: 'Delete field',
            message: `Do you really want to delete <i>${globalFields.get(id).title}</i> field?`,
            close: 'No',
            confirm: 'Yes',
        }, (confirm) => {
            if (confirm) {
                const field = globalFields?.get(id);
                field.synchronized = false;
                field.deleted = true;
            }
        });
    }
}

function onClickEdit(elm) {
    const id = parseInt(elm.getAttribute('data-type-id'));
    const dataType = elm.getAttribute('data-type');
    if(dataType === 'group') {
        showModal({
            title: 'Edit Group',
            message: `Do you really want to edit <i>${globalGroups.get(id).title}</i>`,
            close: 'No',
            confirm: 'Yes',
        }, (confirm) => {
            if (confirm) {
                const group = globalGroups?.get(id);

                // serverAPI.da({
                //       groupId: group.id,
                //       search,
                //   },
                //   updateRows);
            };
        })

    } else {
        showModal({
            title: 'Edit field',
            message: `Do you really want to edit <i>${globalFields.get(id).title}</i> field?`,
            close: 'No',
            confirm: 'Yes',
        }, (confirm) => {
            if (confirm) {
                const field = globalFields?.get(id);

            }
        });
    }
}

async function onClickCopy(elm) {
    const id = parseInt(elm.getAttribute('data-type-id'));
    try {
        await navigator.clipboard.writeText(globalFields?.get(id).value);
    } catch (err) {
        console.error(err);
    }
}

export function onUpdateGui(session) {
    hideAlert();

    globalSession = session;

    const {group, search} = session.getStackNavigator.get();

    elmClicked = false;

    session?.getGui?.buttonLeft0.classList.remove('collapse');
    const buttonLeftImage0 = session?.getGui?.buttonLeftImage0;
    if(session.getStackNavigator.getIndex > 0) {
        document.title = group.title;
        session.getGui.title.innerHTML = group.title;
        buttonLeftImage0.src = '/images/ic_back.svg';
    } else {
        buttonLeftImage0.src = '/images/ic_menu.svg';
    }
    buttonLeftImage0.addEventListener('click', () => {
        if(elmClicked) {
            return;
        }
        elmClicked = true;
        session.getStackNavigator.pop();
        globalSession.loadSync({
            path: '/home',
            title: 'Home',
        });
    });

    session?.getGui?.buttonRight0.classList.remove('collapse');
    const buttonRightImage0 = session?.getGui?.buttonRightImage0;
    buttonRightImage0.classList.remove('collapse');
    buttonRightImage0.src = '/images/ic_add_field.svg';
    buttonRightImage0.addEventListener('click', () => {
        if(elmClicked) {
            return;
        }
        elmClicked = true;
        console.log('buttonRightImage0');
    });

    session?.getGui?.buttonRight1.classList.remove('collapse');
    const buttonRightImage1 = session?.getGui?.buttonRightImage1;
    buttonRightImage1.classList.remove('collapse');
    buttonRightImage1.src = '/images/ic_add_group.svg';
    buttonRightImage1.addEventListener('click', () => {
        if(elmClicked) {
            return;
        }
        elmClicked = true;
        console.log('buttonRightImage1');
    });

    const searchElm = document.getElementById(`search`);
    searchElm.textContent = search;
    searchElm.addEventListener('keyup', event => {
        if(typeof event !== 'object') {
            throw new TypeError(`event it's not a object`);
        }
        if(elmClicked) {
            return;
        }

        globalSession.loadSync({
            path: '/home',
            title: 'Home',
        });

    });


    serverAPI.home({
        groupId: group.id,
        search,
      },
      updateRows);
}

function updateRows({data, error}) {
    hideAlert();
    if(data) {
        const dataContainer = document.getElementById('data-container');
        if(!dataContainer) {
            throw new DOMException('data-container not found', 'home.mjs');
        }
        const ROW = dataContainer.innerHTML;

        globalGroups.clear();
        globalFields.clear();
        elmClicked = false;

        const {groups, fields} = data;

        let table = '';
        try {
            if(groups) {
                for (const group of groups) {
                    globalGroups.set(group.id, group);
                    table += buildRow(ROW, FieldType.GROUP, group);
                }
            }

            if(fields) {
                for (const field of fields) {
                    globalFields.set(field.id, field);
                    table += buildRow(ROW, FieldType.FIELD, field);
                }
            }

        } catch (e) {
            showAlert(error);
        }

        dataContainer.innerHTML = table;

        for (const fader of dataContainer.children) {
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
    } else if(error) {
        showAlert(error);
    } else {
        showAlert('unhandled error');
    }

}
