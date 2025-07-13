import BACKEND_URL from './constants.mjs';


class ServerAPI {
    #enterPoint;
    #sessionId;
    #handleData;
    #defaultDataTransfer;

    constructor(url) {
        if (!new.target) {
            throw new TypeError(`calling ServerAPI constructor without new is invalid`);
        }

        if(typeof url !== 'string') {
            throw new TypeError(`url it's not a object`);
        }

        this.#enterPoint = `${url}/v5/pocket`;
        this.#sessionId = null;
        this.#handleData = (data, callback) => {
            if(data.session_id && typeof data.session_id == 'string' && this.#sessionId === data.session_id) {
                if (!data.error) {
                    callback({ data, error: null });
                } else {
                    callback({ data: null, error: data.error })
                }
            } else if(data.error) {
                callback({ data: null, error: data.error })
            } else {
                callback({data: null, error: Error('No valid session_id')})
            }
        }
        this.#defaultDataTransfer = {
            path: '',
            title: '',
            session_id: null,
            group: null,
            group_fields: null,
            field: null,
            data: null,
            error: null,
        };
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

    login({email, passwd, callback}) {
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
                ...this.#defaultDataTransfer,
                path: '/login',
                session_id: this.#sessionId,
                data: `${email}|${passwd}`,
            })
        })
        .then(response => response.json()) 
        .then(data => this.#handleData(data, callback))
        .catch(error => callback({data: null, error}));
    }

    registration({jsonConfig, email, passwd, confirmPasswd, callback}) {
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

        if(typeof callback !== 'function') {
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
                data: `${jsonConfig}|${email}|${passwd}|${confirmPasswd}`,
            })
        })
          .then(response => response.json())
          .then(data => this.#handleData(data, callback))
          .catch(error => callback({data: null, error}));
    }

    home({groupId, search}) {
        if(this.#sessionId === null) {
            throw new Error(`Session not valid`);
        }

        if(typeof groupId !== 'number') {
            throw new TypeError(`groupId it's not a groupId`);
        }

        if(typeof search !== 'string') {
            throw new TypeError(`search it's not a string`);
        }

        const data =  fetch(this.#enterPoint + '/home', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.#defaultDataTransfer,
                path: '/home',
                session_id: this.#sessionId,
                data: `${groupId}|${search}`,
            })
        }).await;

        return data;
    }


    debug({path, callback}) {
        if(typeof path !== 'string') {
            throw new TypeError(`path it's not a string`);
        }

        if(typeof callback !== 'function') {
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
          .then(data => callback({ data: data, error: null }))
          .catch(error => callback({data: null, error}));
    }
}



const serverAPI = new ServerAPI(BACKEND_URL);

export default serverAPI;