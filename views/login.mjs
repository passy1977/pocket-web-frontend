"use strict";

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');
}

