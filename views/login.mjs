"use strict";

export function onUpdateGui(session) {
    session?.getGui?.buttonLeft0?.classList.add('collapse');
    session?.getGui?.buttonLeft1?.classList.add('collapse');
    session?.getGui?.buttonRight0?.classList.add('collapse');
    session?.getGui?.buttonRight1?.classList.add('collapse');
}

