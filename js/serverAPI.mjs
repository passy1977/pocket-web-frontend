import BACKEND_URL from "./constants.mjs";

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
