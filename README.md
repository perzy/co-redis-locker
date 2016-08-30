# co-redis-locker

[![NPM Version][npm-image]][npm-url]

Distributed cache locker by redis.

## Install

```bash
$ npm install --save co-redis-locker
```

## API


```js
const RedisLocker = require('locker-redis');
const LockerTimeoutError = require('locker-redis').LockerTimeoutError;
```

### RedisLocker(name,options)

RedisLocker class

```js
const lockerName = 'user:100:account';
const options = {};
const redisLocker = new RedisLocker(lockerName, options);
```

### RedisLocker#acquire()
 
Acquire redisLocker retry some times.If timeout then throw timeout error.

```js
const locker = yield redisLocker.acquire();
```

### RedisLocker#release()

Release this redisLocker

```js
yield redisLocker.release();
```

### RedisLocker#sleep()

Sync sleep wait function.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/co-redis-locker.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/co-redis-locker
