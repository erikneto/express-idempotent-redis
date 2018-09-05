'use strict';
let redisClient, idempotencyKey, sleepTime, secondsToCache
const requestStarted = 1;
const requestProcessed = 2;

const processRequest = async (req, res, next) => {
    const reqIDEmpKey = req.get(idempotencyKey);

    if (!reqIDEmpKey) {
        return next();
    }
    const avoidParse = req.get(avoidParse)
    let cachedRequest = await getCachedRequest(reqIDEmpKey)
        .catch((error) => {
            throw error
        })
    if (!cachedRequest) {
        res.sendResponse = res.send
        res.send = async (body) => {
            res.body = body;
            let responseToStore = {
                statusRequest: requestProcessed,
                statusCode: res.statusCode,
                body: res.body,
                headers: res.headers,
            };
            await setCachedRequest(reqIDEmpKey, responseToStore)
                .catch((error) => {
                    throw error
                })
            res.sendResponse(body);
        }
        cachedRequest = {
            statusRequest: requestStarted
        }
        await setCachedRequest(reqIDEmpKey, cachedRequest)
            .catch((error) => {
                throw error
            })
        return next();
    }
    while (cachedRequest && cachedRequest.statusRequest != requestProcessed) {
        cachedRequest = await getCachedRequest(reqIDEmpKey)
            .catch((error) => {
                throw error
            })
        await sleep(sleepTime);
    }
    if (!cachedRequest) {
        return res.status(500).send();
    }
    try {
        if (!avoidParse) {
            cachedRequest.body = JSON.parse(cachedRequest.body);
        }
    } catch (error) {

    }
    res.status(cachedRequest.statusCode);
    res.set(cachedRequest.headers);
    res.set('X-Cache', 'HIT'); // indicate this was served from cache
    res.send(cachedRequest.body);
}

const getCachedRequest = (reqIDEmpKey) => {
    return new Promise(function (resolve, reject) {
        redisClient.get(reqIDEmpKey, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(JSON.parse(result));
        })
    });

}

const setCachedRequest = (reqIDEmpKey, objectToSave) => {
    return new Promise(function (resolve, reject) {
        redisClient.set(reqIDEmpKey, JSON.stringify(objectToSave), 'EX', secondsToCache, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        })
    });
}

const sleep = (milliseconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}
module.exports = (options = {}) => {

    if (!options.redisClient) {
        throw new Error("Redis Client not specified for Idempotent checks")
    }

    redisClient = options.redisClient;

    idempotencyKey = options.idempotencyKey || 'IDEmpKey';
    sleepTime = options.sleepTime || 100;
    secondsToCache = options.secondsToCache || 60;

    return processRequest
};