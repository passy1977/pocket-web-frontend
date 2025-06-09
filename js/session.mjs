
"use strict";

//python -m http.server 8000
export default class Session {
  #callbackUpdate;
  #lastPath;
  #routes;
  #logged;
  #gui

  constructor(gui, callbackUpdate, logged = false) {

    if (!new.target) {
      throw new TypeError(`calling Session constructor without new is invalid`);
    }

    if(typeof gui.alert !== 'object') {
      throw new TypeError(`alert it's not a object`);
    }

    if(typeof gui.context !== 'object') {
      throw new TypeError(`context it's not a object`);
    }

    if(typeof gui.buttonLeft !== 'object') {
      throw new TypeError(`buttonLeft it's not a object`);
    }

    if(typeof gui.buttonLeftImage !== 'object') {
      throw new TypeError(`buttonLeftImage it's not a object`);
    }

    if(typeof gui.title !== 'object') {
      throw new TypeError(`title it's not a object`);
    }

    if(typeof gui.buttonRight0!== 'object') {
      throw new TypeError(`buttonRight0 it's not a object`);
    }

    if(typeof gui.buttonRight0Image !== 'object') {
      throw new TypeError(`buttonRight0Image it's not a object`);
    }

    if(typeof gui.buttonRight1 !== 'object') {
      throw new TypeError(`buttonRight1 it's not a object`);
    }

    if(typeof gui.buttonRight1Image !== 'object') {
      throw new TypeError(`buttonRight1Image it's not a object`);
    }

    if(typeof callbackUpdate !== 'function') {
      throw new TypeError(`callbackUpdate it's not a function`);
    }

    this.#gui = gui;
    this.#callbackUpdate = callbackUpdate;
    this.#logged = logged;

    this.#lastPath = '';
    this.#routes = {
        '/': { 
          urlView: 'views/login.html', 
          urlJs: './views/login.mjs', 
          title: 'Login',
          loginMandatory: false, 
          home: true
        },
        '/registration': { 
          urlView: 'views/registration.html', 
          urlJs: './views/registration.mjs', 
          title: 'Registration',
          loginMandatory: false, 
          home: false
        },
        '/home': { 
          urlView: 'views/home.html', 
          urlJs: './views/home.mjs', 
          title: 'Home',
          loginMandatory: true, 
          home: false
        },
        '/group-detail': { 
          urlView: 'views/group-detail.html', 
          urlJs: './views/group-detail.mjs', 
          title: 'Group',
          loginMandatory: true, 
          home: false
        },
        '/field-detail': { 
          urlView: 'views/field-detail.html', 
          urlJs: './views/field-detail.mjs',
          title: 'Field', 
          loginMandatory: true, 
          home: false
        }
    };
  }

  get getLastPath() {
    return this.#lastPath;
  }

  get getGui() {
    return this.#gui;
  }

  async #loadView(path, route) {
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
        this.#gui.context.innerHTML = data;
      } catch (error) {
        throw new Error(`Failed to load view for ${path}: ${error}`);
      }
    } else {
      throw new Error(`route is null`);
    }
  }

  async #loadJs(path, route) {
    if (typeof path !== 'string') {
      throw new TypeError(`path is not a string`);
    }

    if (typeof route !== 'object' || !route.urlJs) {
      throw new TypeError(`route is not an object or does not have a urlJs property`);
    }

    if (route.urlJs) {
      try {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = route.urlJs;
        script.onload = () => {
          console.log(`Script load successfully: ${route.urlJs}`);

          import('../' + route.urlJs)
          .then(module => module.onUpdateGui(this))
          .catch(err => { throw err; });
        };

        script.onerror = err => {
          throw err;
        };
        
        this.#gui.context.appendChild(script);
      } catch (error) {
        throw new Error(`Failed to load JavaScript for ${path}: ${error}`);
      }
    } else {
      throw new Error(`route is null`);
    }
  }

  async load(path) {
    if(path === undefined || path === null) {
      return false;
    }

    if(typeof path !== 'string') {
      throw new TypeError(`path it's not a string`);
    }

    let route = null;
    if (this.#routes.hasOwnProperty(path)) {
      route = this.#routes[path];
    } else {
      route = this.#routes['/'];
    }

    // if(route.loginMandatory && !this.#logged) {
    //   throw new Error(`Login it's mandatory for ${path}`);
    // }

    document.title = route.title;
    this.#gui.title.innerHTML = route.title;

    try {
      await this.#loadView(path, route);
      await this.#loadJs(path, route);

      this.#callbackUpdate(this.#lastPath);
      return true;
    } catch (error) {
      throw new Error(`Failed to load resources for ${path}: ${error}`);
    }
  }

  loadSynch(path) {
    if(path === undefined || path === null) {
      return false;
    }

    if(typeof path !== 'string') {
      throw new TypeError(`path it's not a string`);
    }

    try {
      this.load(path)                
      .catch(error => {
          throw Error('Error loading resources:', error);
      })
      .then(ret => {
          if (ret) {
              console.log('Session loaded successfully:', ret);
          } else {
              throw Error('Failed to load route');
          }
      });
    } catch (error) {
        throw Error(error);
    }
  }
};

