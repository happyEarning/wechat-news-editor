const Staff = require('../../models/Staff'),
    validateLoginAsStaff = require('../validators/validateLoginAsStaff');

module.exports.login = {
    method : 'post',
    middlewares : [
        (req, res, next) => {
            const {mobile, password} = req.body;
            Staff.findOne({
                mobile,
                password
            })
            .populate('brokerRef')
            .exec((err, staff) => {
                if (staff) {
                    res.$locals.writeData({staff})
                    req.$session.setStaff(staff);
                    next()
                } else {
                    next(new Error('用户名或密码错误'))
                }
            });
        }
    ]
}

module.exports.get = {
    method : 'get',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            res.$locals.writeData({
                staff : req.$injection.staff
            })
            next();
        }
    ]
}

module.exports.logout = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            req.$session.clearStaff();
            next();
        }
    ]
}

module.exports.updatePassword = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            const {currentPassword, password} = req.body;
            Staff.findOne({
                _id : req.$injection.staff.id,
                password : currentPassword
            })
            .exec((err, staff) => {
                if (staff) {
                    staff.password = password;
                    staff.save(next);
                } else {
                    next(new Error('当前密码错误'))
                }
            });
        }
    ]
}

module.exports.resetPassword = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            const {staffRef, password} = req.body;
            Staff.findById(staffRef).exec((err, staff) => {
                staff.password = password;
                staff.save(next);
            });
        }
    ]
}
