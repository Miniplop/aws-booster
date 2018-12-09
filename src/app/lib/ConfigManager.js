/**
 * Handle config thanks to the NODE_ENV var and S3
 */
'use strict';

const logger = require('./logger'),
    moment = require('moment');

const FILE_NOT_EXIST = "FILE_NOT_EXIST";
const MAX_TIME_INTERVAL = 60000;

class Config {
    /**
     * Constructor of the class, it will begin in ready false until it can reach S3 to get the global config
     * The bucket and key of the config file are in env var and if it's not we take it from static config
     *
     * @param {class} s3Tools - A s3 tools which facilitate S3 communication
     */
    constructor(s3Tools) {
        this.s3Tools = s3Tools;
        this.config_loaded = false;
        this.intervalLaunched = false;
        this.lastUpdate = 0;
        this.config = {};
        this.configS3Bucket = process.env.CONFIG_S3_BUCKET;
        this.configS3Key = process.env.CONFIG_S3_KEY;
        this.reloadWaitingDuration = MAX_TIME_INTERVAL;
    }

    /**
     * This function will get the config file from S3. If it's the first time, it launched an interval to reload
     * the configuration every N second -> Check CONFIG_INTERVAL at top of the file
     */
    getConfig() {
        return new Promise(async (resolve, reject) => {
            if (process.env.MOCHA) return resolve(require('../../config'));
            if (this.config_loaded) return resolve(this.config);
            try {
                const configObject = await this.s3Tools.getObject(this.configS3Bucket, this.configS3Key);
                this.config = configObject;
                this.config_loaded = true;
                this.lastUpdate = moment();
                launchConfigInterval(this);
                return resolve(this.config);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

/**
 *  This function will launch an interval to relaunch the S3 config depending of the MAX_TIME_INTERVAL
 *  
 * @param {object} configManager - The ConfigManager Class
 */
function launchConfigInterval(configManager) {
    if(configManager.intervalLaunched) return;
    configManager.intervalLaunched = true;

    setInterval(async () => {
        const now = moment();
        if(now - configManager.lastUpdate > configManager.reloadWaitingDuration) {
            try {
                const configObject = await configManager.s3Tools.getObject(configManager.configS3Bucket, configManager.configS3Key);
                configManager.config = configObject;
                configManager.lastUpdate = moment();
            } catch(err) {
                logger.error("An error occured in the launchConfigInterval", err);
            }
        }
    }, 10000);
}

module.exports = Config;
