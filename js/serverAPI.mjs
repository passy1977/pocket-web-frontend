import BACKEND_URL from './constants.mjs';

export function fetchUserData(userId) {
    fetch(`${BACKEND_URL}/posts/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Utente:', data);
        })
        .catch(error => {
            console.error('Errore nella chiamata alla API:', error);
        });
}

export function login(email, passwd, callback) {

    if(typeof email !== 'string') {
        throw new TypeError(`email it's not a string`); 
    }

    if(typeof passwd !== 'string') {
        throw new TypeError(`passwd it's not a string`); 
    }

    if(typeof callback !== 'function') {
        throw new TypeError(`callback it's not a function`); 
    }

    fetch(`${BACKEND_URL}/v5/pocket/login`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path: '/login',
            jwt: null,
            group: null,
            group_fields: null,
            field: null,
            data: email + '|' + passwd
        })
    })
    .then(response => response.json()) 
    .then(data => callback({data, error: null}))
    .catch(error => callback({data: null, error}));
}