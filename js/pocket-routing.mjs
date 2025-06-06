
export let guiReference = null;

//python -m http.server 8000
export default class Routing {
  #callbackUpdate;
  #lastPath;
  #routes;
  #logged;

  constructor({
    context, 
    buttonLeft, 
    buttonLeftImage, 
    title, 
    buttonRight0, 
    buttonRight0Image, 
    buttonRight1,
    buttonRight1Image
  }, 
  callbackUpdate,
  logged = false
) {

    if (!new.target) {
      throw new TypeError(`calling Routing constructor without new is invalid`);
    }

    if(typeof context !== 'object') {
      throw new TypeError(`context it's not a object`);
    }

    if(typeof buttonLeft !== 'object') {
      throw new TypeError(`buttonLeft it's not a object`);
    }

    if(typeof buttonLeftImage !== 'object') {
      throw new TypeError(`buttonLeftImage it's not a object`);
    }

    if(typeof title !== 'object') {
      throw new TypeError(`title it's not a object`);
    }

    if(typeof buttonRight0!== 'object') {
      throw new TypeError(`buttonRight0 it's not a object`);
    }

    if(typeof buttonRight0Image !== 'object') {
      throw new TypeError(`buttonRight0Image it's not a object`);
    }

    if(typeof buttonRight1 !== 'object') {
      throw new TypeError(`buttonRight1 it's not a object`);
    }

    if(typeof buttonRight1Image !== 'object') {
      throw new TypeError(`buttonRight1Image it's not a object`);
    }

    if(typeof callbackUpdate !== 'function') {
      throw new TypeError(`callbackUpdate it's not a function`);
    }

    guiReference = {
      context,
      buttonLeft,
      buttonLeftImage,
      title,
      buttonRight0,
      buttonRight0Image,
      buttonRight1,
      buttonRight1Image,
    };
    this.#callbackUpdate = callbackUpdate;
    this.#logged = logged;

    this.#lastPath = '';
    this.#routes = {
        '/': { 
          urlView: 'views/login.html', 
          urlJs: './js/pocket-login.mjs', 
          loginMandatory: false, 
          home: true
        },
        '/registration': { 
          urlView: 'views/registration.html', 
          urlJs: './js/pocket-registration.mjs', 
          loginMandatory: false, 
          home: false
        },
        '/home': { 
          urlView: 'views/home.html', 
          urlJs: './js/pocket-home.mjs', 
          loginMandatory: true, 
          home: false
        },
        '/group-detail': { 
          urlView: 'views/group-detail.html', 
          urlJs: './js/pocket-group-detail.mjs', 
          loginMandatory: true, 
          home: false
        },
        '/field-detail': { 
          urlView: 'views/field-detail.html', 
          urlJs: './js/pocket-field-detail.mjs', 
          loginMandatory: true, 
          home: false
        },
    };
  }

  get getLastPath() {
    return this.#lastPath;
  }

  async loadView(path, route) {
    if (typeof path !== 'string') {
      throw new TypeError(`path is not a string`);
    }

    if (typeof route !== 'object' || !route.urlView) {
      throw new TypeError(`route is not an object or does not have a urlView property`);
    }

    if (route.urlView) {
      try {
        const response = await fetch(route.urlView);
        const data = await response.text();
        guiReference.context.innerHTML = data;
      } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(`Failed to load view for ${path}`);
      }
    } else {
      throw new Error(`route is null`);
    }
  }

  async loadJs(path, route) {
    if (typeof path !== 'string') {
      throw new TypeError(`path is not a string`);
    }

    if (typeof route !== 'object' || !route.urlJs) {
      throw new TypeError(`route is not an object or does not have a urlJs property`);
    }

    if (route.urlJs) {
      try {
        const response = await fetch(route.urlJs);
        // const data = await response.text();
        const script = document.createElement('script');
        script.type = 'module';
        script.src = route.urlJs;
        script.onload = () => {
          console.log('Script load successfully');

          import('../' + route.urlJs)
          .then((module) => {
              const { setGuiReference, setRouting } = module;
              setGuiReference(guiReference);
              setRouting(this);
          })
          .catch((err) => {
            console.error('Errore durante l\'importazione del modulo:', err);
          });
        };

        script.onerror = err => {
          throw err;
        };
        
        guiReference.context.appendChild(script);
      } catch (error) {
        throw new Error(`Failed to load JavaScript for ${path}`);
      }
    } else {
      throw new Error(`route is null`);
    }
  }

  async load(path) {
    if(path === undefined || path === null) {
      return false;
    }
    let route = null;
    if (this.#routes.hasOwnProperty(path)) {
      route = this.#routes[path];
    } else {
      route = this.#routes['/'];
    }

    if(route.loginMandatory && !this.#logged) {
      throw new Error(`Login it's mandatory for ${path}`);
    }

    try {
      await this.loadView(path, route);
      await this.loadJs(path, route);

      this.#callbackUpdate(this.#lastPath);
      return true;
    } catch (error) {
      console.error('Error loading resources:', error);
      throw new Error(`Failed to load resources for ${path}`);
    }
  }
};

