
//python -m http.server 8000
export default class Routing {

  #context;
  #callbackUpdate;
  #lastPath;
  #routes;
  constructor({context, callbackUpdate}) {
    if (!new.target) {
      throw new TypeError(`calling Routing constructor without new is invalid`);
    }

    if(typeof context !== 'object') {
      throw new TypeError(`object it's not a object`);
    }

    if(typeof callbackUpdate !== 'function') {
      throw new TypeError(`callbackUpdate it's not a function`);
    }

    this.#lastPath = "";
    this.#callbackUpdate = callbackUpdate;
    this.#context = context;
    this.#routes = {
        '/': { 
          urlView: 'views/login.html', 
          urlJs: 'js/pocket-login.mjs', 
          private: false, 
          redirectIfNotFind: true
        },
        '/registration': { 
          urlView: 'views/registration.html', 
          urlJs: 'js/pocket-registration.mjs', 
          private: true, 
          redirectIfNotFind: false
        },
        '/home': { 
          urlView: 'views/home.html', 
          urlJs: 'js/pocket-home.mjs', 
          private: false, 
          redirectIfNotFind: false
        },
        '/group-detail': { 
          urlView: 'views/group-detail.html', 
          urlJs: 'js/pocket-group-detail.mjs', 
          private: false, 
          redirectIfNotFind: false
        },
        '/field-detail': { 
          urlView: 'views/field-detail.html', 
          urlJs: 'js/pocket-field-detail.mjs', 
          private: false, 
          redirectIfNotFind: false
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
        this.#context.innerHTML = data;
        this.#lastPath = path;
        return this.#lastPath;
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
        const data = await response.text();
        const newElement = document.createElement('script');
        newElement.innerHTML = data;
        this.#context.appendChild(newElement);
        this.#lastPath = path;
        return this.#lastPath;
      } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(`Failed to load JavaScript for ${path}`);
      }
    } else {
      throw new Error(`route is null`);
    }
  }

  async load(path) {
    let route = null;
    if (this.#routes.hasOwnProperty(path)) {
      route = this.#routes[path];
    } else {
      route = this.#routes['/'];
    }

    try {
      let ret = await this.loadView(path, route);
      console.log(2, ret);

      ret = await this.loadJs(path, route);
      console.log(1, ret);

      if (this.#callbackUpdate) {
        this.#callbackUpdate(this.#lastPath);
      }
      this.#lastPath = path;
      return ret; // Return the last path loaded
    } catch (error) {
      console.error('Error loading resources:', error);
      throw new Error(`Failed to load resources for ${path}`);
    }
  }
};
