'use strict';

/**
 * Created by Jerry Wu on 8/30/16.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const debug = require('debug')('redis:locker');
const TimeoutError = require('./timeout_error');

const releaseLua = fs.readFileSync(path.join(__dirname, './release.lua'));


function RedisLocker( name, options ) {
  options = options || {};
  this.name = name;
  this.lockerPrefix = options.lockerPrefix || 'redis_locker:';
  this.timeout = options.timeout || 5000; //ms
  this.retries = options.retries || 10;
  this.retryDelay = options.retryDelay || 250;
  if ( options.client && options.client.set ) {
    this.client = options.client;
  } else {
    try {
      const Redis = require('ioredis');
      this.client = new Redis();
    } catch ( e ) {
      throw new Error("Please provide a redis client instance to lockredis constructor.")
    }
  }
}

/**
 * Acquire the locker you need unit timeout.
 *
 * const locker = yield redisLocker.acquire();
 * // do something
 * locker.release();
 */
RedisLocker.prototype.acquire = function* () {
  this._generateToken();
  const timeout = this.timeout;

  const result = this.client.set([this._getKey(), this.token, 'NX', 'PX', timeout]);
  if ( result !== 'OK' ) {
    if ( this.retries > 0 ) {
      debug('retries: %s', this.retries);

      yield this.sleep(this.retryDelay);
      this.retries--;
      return yield this.acquire();
    }

    throw new TimeoutError("Unable to acquire lock " + this.name);
  }

  return this;
};

RedisLocker.prototype.release = function* () {
  yield this.client.eval([releaseLua, 1, this._getKey(), this.token]);
};

RedisLocker.prototype._getKey = function () {
  return this.lockerPrefix + this.name;
};

RedisLocker.prototype._generateToken = function () {
  this.token = crypto.randomBytes(16).toString('hex');
};

RedisLocker.prototype.sleep = function ( timeout ) {
  return function ( done ) {
    setTimeout(done, timeout);
  };
};

module.exports = RedisLocker;


