Cache / Idempotent controller for ExpressJs

  [![NPM Version]][npm-url]
  [![NPM Downloads]][downloads-url]

```js
const express = require('express')
const app = express() 
const idempotency = require('express-idempotent-redis');
let redis = require("redis"),
    client = redis.createClient();

let counter = 0;
app.use(idempotency({
    redisClient: client
}));

app.get('/', (req, res) =>  {
    counter++;
    res.send(`Hello. This route was executed ${counter} times`);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install express
$ npm install redis
$ npm install express-idempotent-redis 
```

## Features

  * Works as Cache for Express using Redis
  * Focus on high performance
  * Guarantees Idempotent calls for all HTTP verbs

## Guide

  * The API caller needs to send a IdEmpotent key on header (Default is 'IDEmpKey')
  * The builder accepts the following parameters:
    - redisClient => Mandatory. This will be your already initiated Redis Client
    - idempotencyKey => The key that will be monitored (Default is 'IDEmpKey')
    - sleepTime => As your route will only be executed once, this is how long subsequent calls should wait for the main (first) request to finish (in miliseconds)
    - secondsToCache => How long the request should be cached


[npm-url]: https://www.npmjs.com/package/express-idempotent-redis
[downloads-image]: https://img.shields.io/npm/dm/express.svg
[downloads-url]: https://npmjs.org/package/express-idempotent-redis