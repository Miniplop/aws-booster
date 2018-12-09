/**
 * Entry point of the insights API - Creation of the HTTP Server thanks to Express module
 * (We export app to be able to apply tests process like supertest)
 */
'use strict';

const express = require('express'),
    app = express(),
    logger = require('./app/lib/logger'),
    PORT = 3000;

require('./routes')(app);

app.listen(PORT, () => {
    logger.info(`Server currently listening on port: ${PORT}`);
})

module.exports = app;