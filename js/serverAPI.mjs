import BACKEND_URL from './constants.mjs';


class ServerAPI {
    #enterPoint;
    #sessionId;

    constructor(url) {
        if (!new.target) {
            throw new TypeError(`calling ServerAPI constructor without new is invalid`);
        }

        if(typeof url !== 'string') {
            throw new TypeError(`url it's not a object`);
        }

        this.#enterPoint = `${url}/v5/pocket`;
        this.#sessionId = null;
    }

    hello(callback) {
        fetch(this.#enterPoint + '/hello/' + this.#sessionId, {
            method: 'GET', 
            headers: {
                'Content-Type': 'text/plain'
            },
        })
        .then(response => response.json()) 
        .then(data => { 
            if(data.session_id && typeof data.session_id == 'string') {
                this.#sessionId = data.session_id;
                callback({data, error: null});
            } else {
                callback({data: null, error: Error('No valid session_id')})
            }
        })
        .catch(error => callback({data: null, error}));
    }

    login(email, passwd, callback) {
        if(this.#sessionId === null) {
            throw new Error(`Session not valid`);
        }

        if(typeof email !== 'string') {
            throw new TypeError(`email it's not a string`); 
        }

        if(typeof passwd !== 'string') {
            throw new TypeError(`passwd it's not a string`); 
        }

        if(typeof callback !== 'function') {
            throw new TypeError(`callback it's not a function`); 
        }

        fetch(this.#enterPoint + '/login', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/login',
                title: '',
                session_id: this.#sessionId,
                jwt: null,
                group: null,
                group_fields: null,
                field: null,
                data: `${email}|${passwd}`,
                error: null,
            })
        })
        .then(response => response.json()) 
        .then(data => { 
            if(data.session_id && typeof data.session_id == 'string' && this.#sessionId === data.session_id) {
                callback({data, error: null});
            } else {
                callback({data: null, error: Error('No valid session_id')})
            }
        })
        .catch(error => callback({data: null, error}));
    }

    registration({jsonConfig, email, passwd, confirmPasswd}) {
        if(this.#sessionId === null) {
            throw new Error(`Session not valid`);
        }

        if(typeof jsonConfig !== 'string') {
            throw new TypeError(`jsonConfig it's not a string`);
        }

        if(typeof email !== 'string') {
            throw new TypeError(`email it's not a string`);
        }

        if(typeof passwd !== 'string') {
            throw new TypeError(`passwd it's not a string`);
        }

        if(typeof confirmPasswd !== 'string') {
            throw new TypeError(`confirmPasswd it's not a string`);
        }

        fetch(this.#enterPoint + '/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '/registration',
                title: '',
                session_id: this.#sessionId,
                jwt: null,
                group: null,
                group_fields: null,
                field: null,
                data: `${jsonConfig}|${email}|${passwd}|${confirmPasswd}`,
                error: null,
            })
        })
          .then(response => response.json())
          .then(data => {
              if(data.session_id && typeof data.session_id == 'string' && this.#sessionId === data.session_id) {
                  callback({data, error: null});
              } else {
                  callback({data: null, error: Error('No valid session_id')})
              }
          })
          .catch(error => callback({data: null, error}));
    }
}

const serverAPI = new ServerAPI(BACKEND_URL);

export default serverAPI;