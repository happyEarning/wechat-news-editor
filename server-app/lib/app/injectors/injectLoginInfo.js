const async = require('async'),
	Staff = require('../../models/Staff'),
	User = require('../../models/User');

module.exports = (req, res, next) => {
	async.parallel([
		next => {
			const ref = req.$session.getStaffRef();
			if (ref) {
				Staff.findById(ref)
					.populate('brokerRef')
					.exec((err, staff) => {
					req.$injection.staff = staff;
					next()
				})
			} else {
				next()
			}
		},
		next => {
			const ref = req.$session.getUserRef();
			if (ref) {
				User.findById(ref)
					.populate('customerRef')
					.populate('brokerRef')
					.exec((err, user) => {
					req.$injection.user = user;
					next()
				})
			} else {
				next()
			}
		}
	], next)
}