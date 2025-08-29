'use strict';

import { updateMenuContentHeight } from './pocket.mjs';

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

window.addEventListener('beforeunload', event => {
  const message = "Do you want really exit from Pocket 5";
  event.preventDefault();
  event.returnValue = message;
  return message;
});

window.addEventListener('resize', (e) => {
  updateMenuContentHeight();
});