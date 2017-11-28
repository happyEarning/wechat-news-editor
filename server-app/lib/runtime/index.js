// Init runtime: db connetion, logger, wechat api
const async = require('async');

const db = require('./db'),
	log = require('./log'),
	wechat = require('./wechat');

module.exports.init = (next) => {
	async.parallel([
		db.init,
		log.init,
		wechat.init
	], next);
}
