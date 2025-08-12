import BACKEND_URL from './constants.mjs';
import { EmptyGroup } from './pocket.mjs';


class ServerAPI {
  #enterPoint;
  #sessionId;
  #handleData;
  #defaultDataTransfer;
  #fetchData;

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

  hello(callback) {
    this.#dbg();
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
      })
      .catch(error => callback({ data: null, error }));
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
      .then(data => this.#handleData(data, callback))
      .catch(error => callback({ data: null, error }));
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
      .then(data => this.#handleData(data, callback))
      .catch(error => callback({ data: null, error }));
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

    fetch(this.#enterPoint + '/home', {
      method: 'POST',
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
      .then(data => this.#handleData(data, callback))
      .catch(error => callback({ data: null, error }));
  }

  debug({ path, callback }) {
    this.#dbg();
    if (typeof path !== 'string') {
      throw new TypeError(`path it's not a string`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError(`callback it's not a function`);
    }

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
      .then(data => callback({ data, error: null }))
      .catch(error => callback({ data: null, error }));
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
      .then(data => callback({ data, error: null }))
      .catch(error => callback({ data: null, error }));
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

    if (id === 0 && groupId == 0) {
      callback({
        data: {
          ...this.#defaultDataTransfer,
          path: '/group-detail',
          title: 'New group',
          groups: [{...EmptyGroup}],
          group_fields: [],
          session_id: this.#sessionId
        },
        error: null
      });
      return;
    }

    fetch(this.#enterPoint + '/group_detail', {
      method: 'POST',
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
      .then(data => this.#handleData(data, callback))
      .catch(error => callback({ data: null, error }));
  }

}

const serverAPI = new ServerAPI(BACKEND_URL);

export default serverAPI;