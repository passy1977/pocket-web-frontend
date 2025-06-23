"use strict";

export function onUpdateGui(session) {

    const p = document.getElementById('test');
    document.getElementById('test')?.addEventListener('click', () => {
        session.loadSync('/registration');
    });

}
