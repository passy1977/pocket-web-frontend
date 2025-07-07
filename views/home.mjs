'use strict';

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

    let row = ROW;

    row = row.replace('{type}', type === FieldType.GROUP ? 'group' : 'field');
    row = row.replace('{id}', id);
    row = row.replace('{icon}', type === FieldType.GROUP ? 'images/ic_group.svg' : 'images/ic_field.svg');
    row = row.replace('{icon-alt}', type === FieldType.GROUP ? 'Group icon' : 'Field icon');
    row = row.replace('{title}', title);
    if(passwd) {
        row = row.replace('<!--', '');
        row = row.replace('{passwd}', passwd);
        row = row.replace('-->', '')
    } else {
        row = row.replace('{passwd}', '');
    }

    row = row.replace('{buttons}', 'TODO');

    return row;
}

export function onUpdateGui(session) {

    const dataContainer = document.getElementById('data-container');
    if(!dataContainer) {
        throw new DOMException('data-container not found', 'home.mjs');
    }
    const ROW = dataContainer.innerHTML;


    const a = buildRow(
      ROW,
      {
          type: FieldType.GROUP,
          title: 'Test',
          passwd: 'passwd',
      }
    );

    let table = '';
    if(session?.getLastData.groups) {
        for (const group of session?.getLastData.groups) {
            table += buildRow(ROW, {
                type: FieldType.GROUP,
                id: group.id,
                title: group.title,
                passwd: null
            });
        }
    }


    if(session?.getLastData.fields) {
        for (const field of session?.getLastData.fields) {
            table += buildRow(ROW, {
                type: FieldType.GROUP,
                id: field.id,
                title: field.title,
                passwd: field.passwd
            });
        }
    }

    dataContainer.innerHTML = table;

}
