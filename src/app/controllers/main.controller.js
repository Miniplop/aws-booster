/**
 * Main Controller
 * It will orchestrate everything
 */
'use strict';

const utils = require('../lib/utils'),
    logger = require('../lib/logger'),
    S3Tools = require('../lib/S3Tools'),
    aws = require('aws-sdk');

aws.config.update({ region: process.env.AWS_REGION });

const s3 = new aws.S3(),
    s3Tools = new S3Tools(s3)

exports.mainProcess = async (req, res) => {
    try {
        //Return a response
        return res.status(200).json({ msg: "Your api is working !"});
    }
    catch (err) {
        //Handle Errors
        logger.error("An error occured in Main Controller while mainProcess function", req.query, err);
        if(!statusAlreadyReturn) return res.status(400).json({ err: ERROR_CODE_UNKNOWN, msg: "Sorry, an error occured !" });
    }
}