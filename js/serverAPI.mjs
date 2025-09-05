'use strict';

import BACKEND_URL from './constants.mjs';


class ServerAPI {
  #enterPoint;
  #sessionId;
  #handleData;
  #defaultDataTransfer;
  #fetchData;
  #showSpinner;
  #hideSpinner

  constructor(url) {
    if (!new.target) {
      throw new TypeError(`calling ServerAPI constructor without new is invalid`);
    }

    if (typeof url !== 'string') {
      throw new TypeError(`url it's not a string`);
    }

    this.#enterPoint = `${url}/v5/pocket`;
    this.#sessionId = null;
    this.#handleData = (data, callback) => {
      if (data.session_id && typeof data.session_id == 'string' && this.#sessionId === data.session_id) {
        if (!data.error) {
          callback({ data, error: null });
        } else {
          callback({ data: null, error: data.error });
        }
      } else if (data.error) {
        callback({ data: null, error: data.error });
      } else {
        callback({ data: null, error: Error('No valid session_id') });
      }
    };
    this.#defaultDataTransfer = {
      path: '',
      title: '',
      session_id: null,
      groups: null,
      group_fields: null,
      fields: null,
      data: null,
      error: null
    };
    this.#fetchData = async (endPoint, body, method = 'POST', headers = { 'Content-Type': 'application/json' }) => {
      if (typeof endPoint !== 'string') {
        throw new TypeError(`endPoint it's not a string`);
      }

      if (body && typeof body !== 'string') {
        throw new TypeError(`body it's not a string`);
      }

      if (typeof method !== 'string') {
        throw new TypeError(`method it's not a string`);
      }

      if (typeof headers !== 'object') {
        throw new TypeError(`headers it's not a object`);
      }

      const response = await fetch(endPoint,
        {
          method,
          headers,
          body
        });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      await response.json().then(response => response.json()).then(data => data);
    };
  }

  #dbg() {}

  cleanSessionId() {
    if (this.#sessionId) {
      this.#sessionId = null;
    }
  }

  set showSpinner(showSpinner) {
    if (!showSpinner || typeof showSpinner !== 'function') {
      throw new TypeError(`showSpinner it's not a function`);
    }
    this.#showSpinner = showSpinner;
  }

  set hideSpinner(hideSpinner) {
    if (!hideSpinner || typeof hideSpinner !== 'function') {
      throw new TypeError(`hideSpinner it's not a function`);
    }
    this.#hideSpinner = hideSpinner;
  }



  hello(callback) {
    this.#dbg();
    this.#showSpinner();
    fetch(this.#enterPoint + '/hello/' + this.#sessionId, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.session_id && typeof data.session_id == 'string') {
          this.#sessionId = data.session_id;
          callback({ data, error: null });
        } else {
          callback({ data: null, error: Error('No valid session_id') });
        }
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  login({ email, passwd }, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (typeof email !== 'string') {
      throw new TypeError(`email it's not a string`);
    }

    if (typeof passwd !== 'string') {
      throw new TypeError(`passwd it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/login',
        session_id: this.#sessionId,
        data: `${email}|${passwd}`
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  registration({ jsonConfig, email, passwd, confirmPasswd }, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (typeof jsonConfig !== 'string') {
      throw new TypeError(`jsonConfig it's not a string`);
    }

    if (typeof email !== 'string') {
      throw new TypeError(`email it's not a string`);
    }

    if (typeof passwd !== 'string') {
      throw new TypeError(`passwd it's not a string`);
    }

    if (typeof confirmPasswd !== 'string') {
      throw new TypeError(`confirmPasswd it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/registration',
        session_id: this.#sessionId,
        data: `${jsonConfig}|${email}|${passwd}|${confirmPasswd}`
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  home({ groupId, search }, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (typeof groupId !== 'number') {
      throw new TypeError(`groupId it's not a number`);
    }

    if (typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/home', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/home',
        session_id: this.#sessionId,
        data: `${groupId}|${search}`
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  debug({ path, callback }) {
    this.#dbg();
    if (typeof path !== 'string') {
      throw new TypeError(`path it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/debug',
        title: 'Debug',
        session_id: 'debug',
        data: path
      })
    })
      .then(response => response.json())
      .then(data => {
        callback({ data, error: null });
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  data(from, { id, groupId, search = '' }, { groups = null, groupFields = null, fields = null }, callback) {
    this.#dbg();

    if (from && typeof from !== 'string') {
      throw new TypeError(`from it's not a string`);
    }

    if (id && typeof id !== 'number') {
      throw new TypeError(`id it's not a number`);
    }

    if (groupId && typeof groupId !== 'number') {
      throw new TypeError(`groupId it's not a number`);
    }

    if (search && typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (groups && typeof groups !== 'object') {
      throw new TypeError(`group it's not a object`);
    }

    if (groups && typeof groups !== 'object') {
      throw new TypeError(`group it's not a object`);
    }

    if (groupFields && typeof groupFields !== 'object') {
      throw new TypeError(`groupFields it's not a object`);
    }

    if (fields && typeof fields !== 'object') {
      throw new TypeError(`fields it's not a object`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: from,
        title: '',
        session_id: this.#sessionId,
        groups,
        group_fields: groupFields,
        fields,
        data: `${groupId}|${search}|${id}`
      })
    })
      .then(response => response.json())
      // .then(data => callback({ data, error: null }))
      // .catch(error => callback({ data: null, error }));
      .then(data => {
        if (data.session_id && typeof data.session_id == 'string' && this.#sessionId === data.session_id) {
          callback({ data, error: null });
        } else {
          callback({ data: null, error: 'No valid session_id' });
        }
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }


  groupDetail({ id, groupId, search = ''}, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (typeof groupId !== 'number') {
      throw new TypeError(`groupId it's not a number`);
    }

    if (typeof id !== 'number') {
      throw new TypeError(`id it's not a number`);
    }

    if (typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    if (id === 0 && groupId === 0) {
      callback({
        data: {
          ...this.#defaultDataTransfer,
          path: '/group-detail',
          title: 'New group',
          groups: null,
          group_fields: [],
          session_id: this.#sessionId
        },
        error: null
      });
      return;
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/group_detail', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/group_detail',
        session_id: this.#sessionId,
        data: `${groupId}|${search}|${id}`
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  fieldDetail({ id, groupId, search = ''}, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (typeof groupId !== 'number') {
      throw new TypeError(`groupId it's not a number`);
    }

    if (typeof id !== 'number') {
      throw new TypeError(`id it's not a number`);
    }

    if (typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    if (id === 0 && groupId === 0) {
      callback({
        data: {
          ...this.#defaultDataTransfer,
          path: '/field-detail',
          title: 'New field',
          groups: null,
          fields: [],
          session_id: this.#sessionId
        },
        error: null
      });
      this.#hideSpinner();
      return;
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/field_detail', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/field_detail',
        session_id: this.#sessionId,
        data: `${groupId}|${search}|${id}`
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  importData(path = null, callback) {
    //TODO: non implementato
    console.debug('importData', path);
    callback({ data: {}, error: null });
  }

  exportData(path = null, callback) {
    //TODO: non implementato
    console.debug('exportData', path);
    callback({ data: {}, error: null });
  }

  changePasswd({passwd = null, newPasswd = null}, callback) {
    this.#dbg();
    if (this.#sessionId === null) {
      throw new Error(`Session not valid`);
    }

    if (passwd && typeof passwd !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (newPasswd && typeof newPasswd !== 'string') {
      throw new TypeError(`search it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

    this.#showSpinner();
    fetch(this.#enterPoint + '/change_passwd', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.#defaultDataTransfer,
        path: '/home',
        session_id: this.#sessionId,
        data: passwd && newPasswd ? `${passwd}|${newPasswd}` : ''
      })
    })
      .then(response => response.json())
      .then(data => {
        this.#handleData(data, callback);
        this.#hideSpinner();
      })
      .catch(error => {
        callback({ data: null, error });
        this.#hideSpinner();
      });
  }

  closeSession(callback) {
    //TODO: non implementato
    console.debug('closeSession', callback);
    callback({ data: {}, error: null });
  }

  logout(callback) {
    //TODO: non implementato
    console.debug('logout', callback);
    callback({ data: {}, error: null });
  }
}



const serverAPI = new ServerAPI(BACKEND_URL);

export default serverAPI;