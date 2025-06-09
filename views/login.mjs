"use strict";

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft?.addEventListener('click', () => {
        session.loadSynch('/home');
    });
}

