/**
 * Utils functions
 */
'use strict';

const logger = require('./logger'),
    moment = require('moment');

/**
 * Find the index of a simple object (non nested) or -1 if it doesn't find it
 *  
 * @param {array} array 
 * @param {string} key 
 * @param {string} value 
 */
exports.findObjInArray = (array, key, value) => {
    if(!Array.isArray(array) ||
    typeof key !== "string" ||
    typeof value !== "string") return -1;

    for(const [ind, obj] of array.entries()) {
        if(typeof obj === "object" && !Array.isArray(obj) && obj[key] === value) return ind;
    }
    return -1;
}

/**
 * Handle a retry process for the sdk aws. It will use an exponential backof in case of many retries
 *
 * @param {function} func - The function which the retry process will be applied
 * @param {object} param -  The param of the function we want to apply a retry
 * @param {intger} nbRetryMax - The maximum number of retry
 */
exports.retryProcess = (func, param, nbRetryMax) => {
    return new Promise(async (resolve, reject) => {
        logger.info("Retry occured", param);
        if (typeof func !== "function" || typeof param !== "object" || typeof nbRetryMax !== "number") {
            logger.error("retryProcess couldn't work because of bad params", { functype: typeof func, param: param, nbRetryMax: nbRetryMax });
            return reject(new Error(RETRY_PROCESS_BAD_PARAM));
        }
        try {
            var curErr;
            for (let i = 0; i < nbRetryMax; i++) {
                var response = await waitBeforeCall(func, param, i);
                if (!response.err) return resolve(response.data);
                if (!response.err.retryable) return reject(response.err);
                curErr = response.err;
            }
            return reject(curErr);
        } catch (err) {
            return reject(err);
        }
    });
}

/**
 * Allow recursive call with promise for retry process. This method is not public neither exported.
 *
 * @param {function} func - The function which the retry process will be applied
 * @param {object} param -  The param of the function we want to apply a retry
 */
function waitBeforeCall(func, param, nbRetry) {
    return new Promise((resolve, reject) => {
        var wait = 0;
        if (nbRetry > 0) {
            wait = Math.pow(2, nbRetry) * 100;
        }
        setTimeout(() => {
            func(param, (err, data) => {
                return resolve({ err: err, data: data })
            });
        }, wait);
    })
}