'use strict';

export default class HeartbeatTimer {
  #callback;
  #interval;
  #intervalId;
  #remainingTime;
  #startTime;
  #isRunning;
  #isPaused;
  #isExecuting;
  #disable;

  constructor(callback, interval, disable = false) {
    if (!new.target) {
      throw new TypeError(`calling HeartbeatTimer constructor without new is invalid`);
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    if (typeof interval !== 'number' || interval <= 0) {
      throw new TypeError('interval must be a positive number');
    }

    if (typeof disable !== 'boolean') {
      throw new TypeError('interval must be a boolean');
    }


    this.#callback = callback;
    this.#interval = interval;
    this.#disable = disable;
    this.#intervalId = null;
    this.#remainingTime = interval;
    this.#startTime = null;
    this.#isRunning = false;
    this.#isPaused = false;
    this.#isExecuting = false;
  }

  async start() {
    if (this.#disable) return;
    if (this.#isRunning) return;

    this.#isRunning = true;
    this.#isPaused = false;
    this.#startTime = Date.now();

    await this.#scheduleNext();
  }

  stop() {
    if (this.#disable) return;
    if (this.#intervalId) {
      clearTimeout(this.#intervalId);
      this.#intervalId = null;
    }

    this.#isRunning = false;
    this.#isPaused = false;
    this.#isExecuting = false;
    this.#remainingTime = this.#interval;
  }

  pause() {
    if (this.#disable) return;
    if (!this.#isRunning || this.#isPaused) return;

    if (this.#intervalId) {
      clearTimeout(this.#intervalId);
      this.#intervalId = null;
    }

    this.#remainingTime -= Date.now() - this.#startTime;
    this.#isPaused = true;
  }

  async resume() {
    if (this.#disable) return;
    if (!this.#isRunning || !this.#isPaused) return;

    this.#isPaused = false;
    this.#startTime = Date.now();
    await this.#scheduleNext();
  }

  async #scheduleNext() {
    if (this.#disable) return;
    if (!this.#isRunning || this.#isPaused) return;
    
    this.#intervalId = setTimeout(async () => {
      // If already executing, reschedule and return
      if (this.#isExecuting) {
        if (this.#isRunning && !this.#isPaused) {
          this.#scheduleNext();
        }
        return;
      }
      
      this.#intervalId = null;
      this.#isExecuting = true;
      this.#startTime = Date.now();


      try {
        await this.#callback();
      } catch (e) {
        console.error('HeartbeatTimer callback error:', e);
      } finally  {
        this.#isExecuting = false;
      }

      
      // Only schedule next if still running and not paused
      if (this.#isRunning && !this.#isPaused) {
        this.#remainingTime = this.#interval;
        this.#startTime = Date.now();
        this.#scheduleNext();
      }
    }, this.#remainingTime);
  }

  get isRunning() {
    return this.#isRunning;
  }

  get isPaused() {
    return this.#isPaused;
  }

  get isExecuting() {
    return this.#isExecuting;
  }
}