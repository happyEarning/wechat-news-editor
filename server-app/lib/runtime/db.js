const mongoose = require('mongoose');
    mongoose.Promise = Promise;

const config = require('../config');

module.exports.init = function(next) {
    const db = config.db
    	url = `mongodb://${db.user}:${db.password}@${db.url}:${db.port}/${db.schema}`;
    module.exports.url = url;

    //The mongoose.Promise property sets the promises mongoose uses. However, this does not affect the underlying MongoDB driver. 
    //If you use the underlying driver, for instance Model.collection.db.insert(), you need to do a little extra work to change the 
    //underlying promises library. Note that the below code assumes mongoose >= 4.4.4.
    //mongoose.Promise = global.Promise;

    mongoose.connect(url, {
        //Mongoose's default connection logic is deprecated as of 4.11.0. Please opt in to the new connection logic using the useMongoClient option, 
        //but make sure you test your connections first if you're upgrading an existing codebase!
        useMongoClient: true, 
        server : {
            poolSize : db.poolSize,
            socketOptions : {
                keepAlive : 256
            },
        }
    }, next);
};
