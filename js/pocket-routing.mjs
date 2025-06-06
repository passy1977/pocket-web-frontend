

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
          urlJs: 'js/pocket-web.mjs', 
          private: false, 
          redirectIfNotFind: true
        },
        '/registration': { 
          urlView: 'views/registration.html', 
          urlJs: 'js/pocket-web.mjs', 
          private: true, 
          redirectIfNotFind: false
        },
        '/home': { 
          urlView: 'views/home.html', 
          urlJs: 'js/pocket-web.mjs', 
          private: false, 
          redirectIfNotFind: false
        },
        '/group-detail': { 
          urlView: 'views/group-detail.html', 
          urlJs: 'js/pocket-web.mjs', 
          private: false, 
          redirectIfNotFind: false
        },
        '/field-detail': { 
          urlView: 'views/field-detail.html', 
          urlJs: 'js/pocket-web.mjs', 
          private: false, 
          redirectIfNotFind: false
        },
    };
  }

  get getLastPath() {
    return this.#lastPath;
  }

  load(path) {
    if(typeof path !== 'string') {
      throw new TypeError(`object it's not a object`);
    }

    let route = null;
    if (this.#routes.hasOwnProperty(path)) {
      route = this.#routes[path];
    } else {
      route = this.#routes['/'];
    }

    if (route.urlView) {
      fetch(route.urlView)
        .then(response => response.text())
        .then(data => {
          this.#context.innerHTML = data;
          this.#lastPath = path;
          if(this.#callbackUpdate) {
            this.#callbackUpdate(this.#lastPath);
          }
        });
    } else {
        this.#context.innerHTML = '<h1>404 Not Found</h1>';
        this.#lastPath = null;
        if(this.#callbackUpdate) {
          this.#callbackUpdate(this.#lastPath);
        }
    }
  }


};
