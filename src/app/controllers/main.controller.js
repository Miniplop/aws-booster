/**
 * Main Controller
 * It will orchestrate everything
 */
'use strict';

const logger = require('../lib/logger');

exports.mainProcess = async (req, res) => {
    try {
        //Return a response
        return res.send('Hello World!');
    }
    catch (err) {
        //Handle Errors
        logger.error("An error occured in Main Controller while mainProcess function", req.query, err);
    }
}
