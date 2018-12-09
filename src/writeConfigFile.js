var fs = require('fs');

fs.writeFile('strConfig', JSON.stringify(require('./config.json')), (err) => {
    if(err) throw new Error(err);
})