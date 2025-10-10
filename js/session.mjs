'use strict';

import showAlert from './pocket.mjs';
import StackNavigator from './stack-navigator.mjs';
import { TITLE } from './constants.mjs';

export default class Session {
  #gui;
  #stackNavigator;
  #lastData;
  #lastPath;
  #buttonLeft0Callback = null;
  #buttonRight0Callback = null;
  #buttonRight1Callback = null;

  constructor(gui, defaultGroup) {

    if (!new.target) {
      throw new TypeError(`calling Session constructor without new is invalid`);
    }

    if (typeof gui.alert !== 'object') {
      throw new TypeError(`alert it's not a object`);
    }

    if (typeof gui.context !== 'object') {
      throw new TypeError(`context it's not a object`);
    }

    if (typeof gui.buttonLeft0 !== 'object') {
      throw new TypeError(`buttonLeft0 it's not a object`);
    }

    if (typeof gui.buttonLeftImage0 !== 'object') {
      throw new TypeError(`buttonLeftImage0 it's not a object`);
    }

    if (typeof gui.buttonLeft1 !== 'object') {
      throw new TypeError(`buttonLeft1 it's not a object`);
    }

    if (typeof gui.buttonLeftImage1 !== 'object') {
      throw new TypeError(`buttonLeftImage1 it's not a object`);
    }

    if (typeof gui.title !== 'object') {
      throw new TypeError(`title it's not a object`);
    }

    if (typeof gui.buttonRight0 !== 'object') {
      throw new TypeError(`buttonRight0 it's not a object`);
    }

    if (typeof gui.buttonRightImage0 !== 'object') {
      throw new TypeError(`buttonRightImage0 it's not a object`);
    }

    if (typeof gui.buttonRight1 !== 'object') {
      throw new TypeError(`buttonRight1 it's not a object`);
    }

    if (typeof gui.buttonRightImage1 !== 'object') {
      throw new TypeError(`buttonRightImage1 it's not a object`);
    }

    this.#gui = gui;
    this.#stackNavigator = new StackNavigator(defaultGroup);

    this.#gui.buttonLeftImage0.addEventListener('click', e => {
      if (this.#buttonLeft0Callback) this.#buttonLeft0Callback(e);
    });
    this.#gui.buttonRightImage0.addEventListener('click', e => {
      if (this.#buttonRight0Callback) this.#buttonRight0Callback(e);
    });
    this.#gui.buttonRightImage1.addEventListener('click', e => {
      if (this.#buttonRight1Callback) this.#buttonRight1Callback(e);
    });
  }

  get lastData() {
    return this.#lastData;
  }

  get lastPath() {
    return this.#lastPath;
  }

  get gui() {
    return this.#gui;
  }

  get stackNavigator() {
    return this.#stackNavigator;
  }

  setButtonLeft0Callback(src, callback) {
    if (src != null && typeof src !== 'string') {
      throw new TypeError(`src it's not a string`);
    }

    if (callback !== null && typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }
    if(callback) {
      this.#gui?.buttonLeft0?.classList.remove('collapse');
    } else {
      this.#gui?.buttonLeft0?.classList.add('collapse');
    }

    if(src) {
      this.#gui.buttonLeftImage0.src = src;
    }

    this.#gui?.buttonLeft0?.classList.remove('collapse');
    this.#buttonLeft0Callback = callback;
  }

  setButtonRight0Callback(src, callback) {
    if (src != null && typeof src !== 'string') {
      throw new TypeError(`src it's not a string`);
    }

    if (callback !== null && typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }
    if(callback) {
      this.#gui?.buttonRight0?.classList.remove('collapse');
    } else {
      this.#gui?.buttonRight0?.classList.add('collapse');
    }

    if(src) {
      this.#gui.buttonRightImage0.src = src;
    }

    this.#gui?.buttonRight0?.classList.remove('collapse');
    this.#buttonRight0Callback = callback;
  }

  setButtonRight1Callback(src, callback) {
    if (src != null && typeof src !== 'string') {
      throw new TypeError(`src it's not a string`);
    }

    if (callback !== null && typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }
    if(callback) {
      this.#gui?.buttonRight1?.classList.remove('collapse');
    } else {
      this.#gui?.buttonRight1?.classList.add('collapse');
    }

    if(src) {
      this.#gui.buttonRightImage1.src = src;
    }

    this.#buttonRight1Callback = callback;
  }

  resetGuiCallbacks() {
    this.setButtonLeft0Callback(null, null);
    this.setButtonRight0Callback(null, null);
    this.setButtonRight1Callback(null, null);
  }

  resetGui() {
    this.#gui.buttonLeft0?.classList.add('collapse');
    this.#gui.buttonLeftImage0?.classList.add('collapse');
    this.#gui.buttonLeft1?.classList.add('collapse');
    this.#gui.buttonLeftImage1?.classList.add('collapse');
    this.#gui.title.innerHTML = TITLE;
    this.#gui.buttonRight0?.classList.add('collapse');
    this.#gui.buttonRightImage0?.classList.add('collapse');
    this.#gui.buttonRight1?.classList.add('collapse');
    this.#gui.buttonRightImage1?.classList.add('collapse');
    this.#gui.context.innerHTML = '';
    this.#gui.buttonLeft0.alt = '';
    this.#gui.buttonLeftImage0.alt = '';
    this.#gui.buttonLeft1.alt = '';
    this.#gui.buttonLeftImage1.alt = '';
    this.#gui.buttonRight0.alt = '';
    this.#gui.buttonRightImage0.alt = '';
    this.#gui.buttonRight1.alt = '';
    this.#gui.buttonRightImage1.alt = '';
    document.title = TITLE;
    this.resetGuiCallbacks();
  }


  invalidate() {
    this.#stackNavigator.invalidate();
    this.#lastData = null;
    this.#lastPath = null;
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
        script.onload = () =>
          import(fullPath)
            .then(module => module.onUpdateGui(this))
            .catch(err => showAlert(err.message));

        script.onerror = err => showAlert(err.message);


        this.#gui.context.appendChild(script);
      } catch (error) {
        throw new Error(`Failed to load JavaScript for ${fullPath}: ${error}`);
      }
    } else {
      throw new Error(`path is null`);
    }
  }

  async load(data, showTitle = true) {
    if (data === undefined || data === null) {
      return;
    }

    if (typeof data !== 'object') {
      throw new TypeError(`data it's not a object`);
    }

    this.#lastData = data;

    let { path, title } = this.#lastData;

    if (path.startsWith('http')) {
      throw new Error(`path can't start with "http"`);
    }

    if (path === '/') {
      path = '/login';
      title = 'Login';
    }

    if (showTitle) {
      document.title = `${TITLE} - ${title}`;
      this.#gui.title.innerHTML = title;
    }

    this.#lastPath = path;


    try {
      await this.#loadHtml(path);
      await this.#loadJs(path);

      return true;
    } catch (error) {
      throw new Error(`Failed to load resources for ${path}: ${error}`);
    }
  }

  loadSync(data, showTitle = true) {
    if (data === undefined || data === null) {
      return;
    }

    if (typeof data !== 'object') {
      throw new TypeError(`data it's not a object`);
    }

    try {
      this.load(data, showTitle)
        .catch(err => {
          showAlert(err);
        })
        .then(ret => {
          if (!ret) {
            throw Error(`Failed to load route: ${ data.path }`);
          }
        });
    } catch (error) {
      throw Error(error);
    }
  }
};

