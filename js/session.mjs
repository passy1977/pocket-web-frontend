
"use strict";

import showAlert from './pocket.mjs';

export class GroupStacked {
  #group;
  #search

  constructor(group, search) {
    if (!new.target) {
      throw new TypeError(`calling GroupStacked constructor without new is invalid`);
    }

    if(typeof group !== 'object') {
      throw new TypeError(`group it's not a object`);
    }

    if(typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    this.#group = group;
    this.#search = search;
  }

  getGroup() {
    return this.#group;
  }

  getSearch() {
    return this.#search;
  }

}
//python -m http.server 8000
export default class Session {
  #callbackUpdate;
  #gui;
  #navigator;
  #lastData;


  constructor(gui, callbackUpdate) {

    if (!new.target) {
      throw new TypeError(`calling Session constructor without new is invalid`);
    }

    if(typeof gui.alert !== 'object') {
      throw new TypeError(`alert it's not a object`);
    }

    if(typeof gui.context !== 'object') {
      throw new TypeError(`context it's not a object`);
    }

    if(typeof gui.buttonLeft0 !== 'object') {
      throw new TypeError(`buttonLeft0 it's not a object`);
    }

    if(typeof gui.buttonLeftImage0 !== 'object') {
      throw new TypeError(`buttonLeftImage0 it's not a object`);
    }

    if(typeof gui.buttonLeft1 !== 'object') {
      throw new TypeError(`buttonLeft1 it's not a object`);
    }

    if(typeof gui.buttonLeftImage1 !== 'object') {
      throw new TypeError(`buttonLeftImage1 it's not a object`);
    }

    if(typeof gui.title !== 'object') {
      throw new TypeError(`title it's not a object`);
    }

    if(typeof gui.buttonRight0!== 'object') {
      throw new TypeError(`buttonRight0 it's not a object`);
    }

    if(typeof gui.buttonRightImage0 !== 'object') {
      throw new TypeError(`buttonRightImage0 it's not a object`);
    }

    if(typeof gui.buttonRight1 !== 'object') {
      throw new TypeError(`buttonRight1 it's not a object`);
    }

    if(typeof gui.buttonRightImage1 !== 'object') {
      throw new TypeError(`buttonRightImage1 it's not a object`);
    }

    if(typeof callbackUpdate !== 'function') {
      throw new TypeError(`callbackUpdate it's not a function`);
    }

    this.#callbackUpdate = callbackUpdate;
    this.#gui = gui;
    this.#navigator = {
      stack: [new GroupStacked({id: 0, note: ''}, "")],
      index: 0,
    };
  }

  get getLastData() {
    return this.#lastData;
  }

  get getGui() {
    return this.#gui;
  }

  get getNavigator() {
    return this.#navigator;
  }

  async #loadHtml(path) {
    if (typeof path !== 'string') {
      throw new TypeError(`path is not a string`);
    }

    if (path) {
      const fullPath = `/views${path}.html`;
      try {
        const response = await fetch(fullPath);
        const data = await response.text();
        this.#gui.context.innerHTML = data;
      } catch (error) {
        throw new Error(`Failed to load view for ${fullPath}: ${error}`);
      }
    } else {
      throw new Error(`path is null`);
    }
  }

  async #loadJs(path) {
    if (typeof path !== 'string') {
      throw new TypeError(`path is not a string`);
    }

    if (path) {
      const fullPath = `/views${path}.mjs`;

      try {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = fullPath;
        script.onload = () => {
          console.log(`Script load successfully: ${fullPath}`);

          import(fullPath)
          .then(module => module.onUpdateGui(this))
          .catch(err => showAlert(err.message));
        };

        script.onerror = err => showAlert(err.message)
        
        
        this.#gui.context.appendChild(script);
      } catch (error) {
        throw new Error(`Failed to load JavaScript for ${fullPath}: ${error}`);
      }
    } else {
      throw new Error(`path is null`);
    }
  }

  async load(data) {
    if(data === undefined || data === null) {
      return false;
    }

    if(typeof data !== 'object') {
      throw new TypeError(`data it's not a object`);
    }
    
    this.#lastData = data;

    let {path, title} = this.#lastData;

    if(path.startsWith('http')) {
      throw new Error(`path can't start with "http"`);
    }

    if(path === '/') {
      path = '/login';
      title = 'Login';
    }

    document.title = title;
    this.#gui.title.innerHTML = title;

    try {
      await this.#loadHtml(path);
      await this.#loadJs(path);

      this.#callbackUpdate(this.#lastData);
      return true;
    } catch (error) {
      throw new Error(`Failed to load resources for ${path}: ${error}`);
    }
  }

  loadSync(data) {
    if(data === undefined || data === null) {
      return false;
    }

    if(typeof data !== 'object') {
      throw new TypeError(`data it's not a object`);
    }

    try {
      this.load(data)                
      .catch(err => {
          showAlert(err);
      })
      .then(ret => {
          if (ret) {
              console.log('Session loaded successfully:', ret);
          } else {
              throw Error('Failed to load route');
          }
      });
    } catch (error) {
        throw Error(error);
    }
  }
};

