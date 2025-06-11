'use strict';

import showAlert from './pocket.mjs';

class Socket {
    #socket;
    #isConnect;

    constructor(backendUrl) {
        if (!new.target) {
        throw new TypeError(`calling Session constructor without new is invalid`);
        }

        if(typeof backendUrl !== 'string') {
        throw new TypeError(`backendUrl it's not a object`);
        }

        this.#socket = new WebSocket(backendUrl);
        this.#socket.onopen = () =>  {
            console.log('Socket Opened');
            this.#isConnect = true;
            //setInterval(_ => socket.send('Hello rust!'), 3000)
        }
        this.#socket.onmessage = (msg) => alert(msg.data);
        this.#socket.onerror = (err) => showAlert(err.message);
        this.#socket.onclose = () => console.log('Socket Closed');
    }

    get isConnect() {
        return this.#isConnect;
    }

    set setCallbacks({onMessage, onError, onClose}) {
        this.#socket.onmessage = onMessage;
        this.#socket.onerror = onError;
        this.#socket.onclose = () => {
            this.#isConnect = false;
            if(onClose) {
                onClose();
            }
            console.log('Socket Closed');
        };
    }
}

export default Socket;