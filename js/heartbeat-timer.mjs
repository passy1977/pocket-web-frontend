'use strict';

export default class HeartbeatTimer {
  #callback;
  #interval;
  #intervalId;
  #remainingTime;
  #startTime;
  #isRunning;
  #isPaused;

  constructor(callback, interval) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    if (typeof interval !== 'number' || interval <= 0) {
      throw new TypeError('interval must be a positive number');
    }

    this.#callback = callback;
    this.#interval = interval;
    this.#intervalId = null;
    this.#remainingTime = interval;
    this.#startTime = null;
    this.#isRunning = false;
    this.#isPaused = false;
  }

  start() {
    if (this.#isRunning) return;

    this.#isRunning = true;
    this.#isPaused = false;
    this.#startTime = Date.now();

    this.#scheduleNext();
  }

  stop() {
    if (this.#intervalId) {
      clearTimeout(this.#intervalId);
      this.#intervalId = null;
    }

    this.#isRunning = false;
    this.#isPaused = false;
    this.#remainingTime = this.#interval;
  }

  pause() {
    if (!this.#isRunning || this.#isPaused) return;

    if (this.#intervalId) {
      clearTimeout(this.#intervalId);
      this.#intervalId = null;
    }

    this.#remainingTime -= Date.now() - this.#startTime;
    this.#isPaused = true;
  }

  resume() {
    if (!this.#isRunning || !this.#isPaused) return;

    this.#isPaused = false;
    this.#startTime = Date.now();
    this.#scheduleNext();
  }

  #scheduleNext() {
    this.#intervalId = setTimeout(() => {
      this.#callback();
      this.#remainingTime = this.#interval;
      this.#startTime = Date.now();
      this.#scheduleNext();
    }, this.#remainingTime);
  }

  get isRunning() {
    return this.#isRunning;
  }

  get isPaused() {
    return this.#isPaused;
  }
}