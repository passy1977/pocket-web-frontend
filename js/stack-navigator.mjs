'use strict';


export default class StackNavigator {
  #stack;
  #index;

  constructor(defaultGroup) {
    if (!new.target) {
      throw new TypeError(`calling StackNavigator constructor without new is invalid`);
    }

    this.#stack = [];
    this.#stack.push({ group: { ...defaultGroup }, search: '', path: '' });
    this.#index = 0;
  }

  push(group, search = '') {
    if (typeof group !== 'object') {
      throw new TypeError(`group it's not a object`);
    }

    if (typeof search !== 'string') {
      throw new TypeError(`search it's not a string`);
    }
    this.#index++;
    this.#stack.push({ group, search });
  }

  pop() {
    if (this.#index > 0) {
      this.#index--;
      return this.#stack.pop();
    } else {
      return null;
    }

  }

  get(index = this.#index) {
    if (typeof index !== 'number') {
      throw new TypeError(`index it's not a number`);
    }
    return this.#stack[index];
  }

  get index() {
    return this.#index;
  }

  invalidate() {
    this.#stack = this.#stack.slice(0, 1);
    this.#index = 0;
  }
}