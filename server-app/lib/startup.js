const runtime = require('./runtime'),
	app = require('./app'),
	schedulers = require('./schedulers');

runtime.init(() => {
	var logger = require('./runtime/log').byJs(__filename);
	logger.info('runtime init complete.')
	app.bootstrap(() => {
		logger.info('=> app bootstrap complete.')
	});
	schedulers.bootstrap(() => {
		logger.info('=> schedulers bootstrap complete.')
	});
});
