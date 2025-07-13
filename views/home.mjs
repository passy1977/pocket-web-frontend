'use strict';

import serverAPI from '../js/serverAPI.mjs';

const FieldType = Object.freeze({
    GROUP: 0,
    FIELD: 1
});

function buildRow(ROW, {
    type,
    id,
    title,
    passwd,
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

    if(type === FieldType.FIELD && typeof passwd !== 'string') {
        throw new TypeError(`passwd it's not a string`);
    }


    let row = ROW.replaceAll('{type}', type === FieldType.GROUP ? 'group' : 'field');
    row = row.replaceAll('{id}', id);
    row = row.replaceAll('{icon}', type === FieldType.GROUP ? 'images/ic_group.svg' : 'images/ic_field.svg');
    row = row.replaceAll('{icon-alt}', type === FieldType.GROUP ? 'Group icon' : 'Field icon');
    row = row.replaceAll('{title}', title);
    if(passwd) {
        row = row.replaceAll('<!--', '');
        row = row.replaceAll('{passwd}', passwd);
        row = row.replaceAll('-->', '')
    } else {
        row = row.replaceAll('{passwd}', '');
    }

    row = row.replaceAll('{buttons}', 'TODO');

    return row;
}

function onClick(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }

    console.log('click', elm);
}

function onTogglePasswd(elm) {
    if(typeof elm !== 'object') {
        throw new TypeError(`elm it's not a object`);
    }

    console.log('togglePasswd', elm);
}

export function onUpdateGui(session) {
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

    const data = serverAPI.home(session.getNavigator[0]);

    let table = '';
    if(data?.groups) {
        for (const group of session?.getLastData.groups) {
            table += buildRow(ROW, {
                type: FieldType.GROUP,
                id: group.id,
                title: group.title,
                passwd: null
            });
        }
    }

    if(data?.fields) {
        for (const field of session?.getLastData.fields) {
            table += buildRow(ROW, {
                type: FieldType.FIELD,
                id: field.id,
                title: field.title,
                passwd: field.passwd
            });
        }
    }



    table += buildRow(ROW, {
        type: FieldType.GROUP,
        id: 1,
        title: 'Test group',
        passwd: null
    });

     table += buildRow(ROW, {
        type: FieldType.FIELD,
        id: 2,
        title: 'Test field',
        passwd: 'passwd'
    });

    dataContainer.innerHTML = table;

    for (const fader of dataContainer.children) {
        for (const child of fader.children) {
            const dataField = child.getAttribute('data-field');
            if(dataField) {
                child.setAttribute('data-hidden', true);
                const textContent = child.textContent.trim();
                child.textContent = '*'.repeat(textContent.length);

                child.addEventListener('click', () => onTogglePasswd(child));
            } else {
                child.addEventListener('click', () => onClick(child));
            }

        }
    }

}
