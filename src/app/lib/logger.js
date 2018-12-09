/**
 * 
 */
'use strict';

const winston = require("winston"),
    moment = require('moment');

const APP_NAME = 'BASIC-API';

/**
 * Exports a winston logger
 * 
 * We enrich the logs with an app name, the current date in ISO 8601 format and the environment
 * We return the log object stringified
 */
module.exports = new winston.Logger({
    transports: [
        new winston.transports.Console({
            json: true,
            stringify: function(obj) {
                obj.env = process.env.NODE_ENV || 'dev';
                obj.date = moment().toISOString();
                obj.app_name = APP_NAME;
                if (obj.message == "") {
                    delete obj.message;
                }
                
                return JSON.stringify(obj);
            }
        })
    ]
});