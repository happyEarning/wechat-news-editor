const Summary = require('../../models/Summary'),
    Order = require('../../models/Order'),
    Factory = require('../../models/Factory'),
	Excel = require('exceljs'),
	Fs = require('fs'),
    validateLoginAsStaff = require('../validators/validateLoginAsStaff'),
    {createSummaryMailAttachment} = require('../../decorators/MailAttachmentDecorator'),
    sendMailDecorator = require('../../decorators/SendMailDecorator'),
    async = require('async');

module.exports.query = {
    method : 'get',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            if(req.query.isSent){
                Summary.find()
                .populate('factoryRef')
                .populate('orderRefs')
                .populate('createrRef')
                .sort({createdAt: -1})
                .exec(function(err,summarys){
                    res.$locals.writeData({summarys});
                    next();
                })
            }else{
                //汇总当前预约单
                Order.aggregate([{
                        $match: {
                            status: Order.PAID,
                        }
                    }, {
                        $group: {
                            _id: "$item",
                            num_tutorial: {
                                $sum: "$num"
                            }
                        }
                    }

                ], function(err, results) {
                    let summarys = [];
                    async.series(results.map(result => {
                        return callback => {
                            Order.find({
                                item:result._id,
                                status: Order.PAID
                            })
                            .select(['_id','no'])
                            .exec((err,orders) => {
                                let summary = {
                                    item:result._id,
                                    num:result.num_tutorial,
                                    orderRefs:[]
                                }
                                orders.map(order => {
                                    const orderRef = {
                                        _id:order.id,
                                        no:order.no
                                    }
                                    summary.orderRefs.push(orderRef);
                                })
                                summarys.push(summary);
                                callback();
                            })
                        }
                    }), err => {
                        res.$locals.writeData({summarys});
                        next();
                    })
                })
            }
        }
    ]
}


module.exports.send = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        createSummaryMailAttachment,
        (req, res, next) => {
        	Factory.findById(req.body.factoryRef).exec((err,factory)=>{
        		if(factory){
        			sendMailDecorator(factory.mail,
        				req.$injection.attachments,
        				'真裁时料订单：' + req.body.summary.item,
        				'订单个数：' + req.$injection.attachments.length,
        				err=>{
                            if(err){
                                next(new Error('邮件发送失败，请确认工厂邮箱是否正确'));
                                return;
                            }else{
                                next();
                            }
                        });
        		}else{
        			next(new Error('指定工厂不存在'));
        			return;
        		}
        	})
        },
        (req, res, next) => {
        	let summay = new Summary({
        		item:req.body.summary.item,
        		num:req.body.summary.num,
        		factoryRef:req.body.factoryRef,
        		orderRefs:req.body.summary.orderRefs,
        		createrRef:req.$injection.staff.id
        	})
        	summay.save(next);
        },
        (req, res, next) => {
        	async.series(req.body.summary.orderRefs.map(orderRef=>{
        		return callback => {
        			Order.update({
		                '_id' : orderRef._id
		            }, {
		                '$set' : {status:Order.SENT_FACTORY}
		            }, {
		                'multi' : false
		            }, callback);
        		}
        	}),next)
        },
        (req, res, next) => {
        	async.series(req.$injection.attachments.map(attachment=>{
        		return callback => {
        			Fs.unlink(attachment.path,callback);
        		}
        	}),next)
        },
    ]
}

