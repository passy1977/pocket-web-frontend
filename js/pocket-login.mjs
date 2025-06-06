export function onLoad(guiReference, routing) {
    guiReference?.buttonLeft?.addEventListener('click', () => {
        if (!routing) {
            console.error('Routing instance is not initialized');
            alert('Routing instance is not initialized. Please try reloading the page.');
            return;
        }

        try {
            routing.load('/home')                
            .catch(error => {
                console.error('Error loading resources:', error);
                alert(`${error.message}`);
            })
            .then(ret => {
                if (ret) {
                    console.log("Route loaded successfully:", ret);
                } else {
                    console.log("Failed to load route.");
                }
            });
        } catch (error) {
            console.error(error);
        }
    });
}

