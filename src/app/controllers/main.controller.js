/**
 * Main Controller
 * It will orchestrate everything
 */
'use strict';

const utils = require('../lib/utils'),
    logger = require('../lib/logger'),
    ConfigManager = require('../lib/ConfigManager'),
    S3Tools = require('../lib/S3Tools'),
    aws = require('aws-sdk');

aws.config.update({ region: process.env.AWS_REGION });

const s3 = new aws.S3(),
    s3Tools = new S3Tools(s3),
    configManager = new ConfigManager(s3Tools);

const ERROR_CODE_UNKNOWN = {
    error_code: 40000,
    msg: 'An Unknown Error Occurred'
};

exports.mainProcess = async (req, res) => {
    try {
        //Get the global config
        const config = await configManager.getConfig();

        //Return a response
        return res.status(200).json({ msg: "Your api is working !", "s3_config": config });
    }
    catch (err) {
        //Handle Errors
        logger.error("An error occured in Main Controller while mainProcess function", req.query, err);
        if(!statusAlreadyReturn) return res.status(400).json({ err: ERROR_CODE_UNKNOWN, msg: "Sorry, an error occured !" });
    }
}