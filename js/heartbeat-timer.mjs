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
    this.#isExecuting = false;
  }

  async start() {
    if (this.#isRunning) return;

    this.#isRunning = true;
    this.#isPaused = false;
    this.#startTime = Date.now();

    await this.#scheduleNext();
  }

  stop() {
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
    if (!this.#isRunning || this.#isPaused) return;

    if (this.#intervalId) {
      clearTimeout(this.#intervalId);
      this.#intervalId = null;
    }

    this.#remainingTime -= Date.now() - this.#startTime;
    this.#isPaused = true;
  }

  async resume() {
    if (!this.#isRunning || !this.#isPaused) return;

    this.#isPaused = false;
    this.#startTime = Date.now();
    await this.#scheduleNext();
  }

  async #scheduleNext() {
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
        // Support both sync and async callbacks
        await this.#callback();
        this.#isExecuting = false;
      } catch (e) {
        // Optionally handle callback errors
        console.error('HeartbeatTimer callback error:', e);
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