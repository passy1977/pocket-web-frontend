"use strict";

const FieldType = Object.freeze({
    GROUP: 0,
    FIELD: 1
});

function buildRow(ROW, {
    type,
    title,
    passwd,
}) {
    if(typeof ROW !== 'string') {
        throw new TypeError(`ROW it's not a string`);
    }

    if(typeof type !== 'object') {
        throw new TypeError(`type it's not a object`);
    }

    if(typeof title !== 'string') {
        throw new TypeError(`title it's not a string`);
    }

    if(typeof passwd !== 'string') {
        throw new TypeError(`passwd it's not a string`);
    }

    let row = ROW;

    row = row.replace("{NOME}", "Mario");

    row = row.replace("{LUOGO}", "Roma");

}

export function onUpdateGui(session) {

    const dataContainer = document.getElementById('data-container');
    if(!dataContainer) {
        throw new DOMException('data-container not found', 'home.mjs');
    }
    const ROW = dataContainer.innerHTML;
    console.log(ROW);




}
