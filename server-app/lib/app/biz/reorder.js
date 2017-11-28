const Reorder = require('../../models/Reorder'),
        Order = require('../../models/Order'),
        GenericStatus = require('../../models/enum/GenericStatus'),
    validateLoginAsStaff = require('../validators/validateLoginAsStaff');

_findOrderById = (reorderRef,next) => {
    Reorder.findById(reorderRef)
        .populate('createrRef')
        .populate('customerRef')
        .populate('brokerRef')
        .populate('approverRef')
        .populate(
            {
                path: 'originOrderRef',
                select: null,
                model: 'Order',
                populate: [{
                    path: 'customerRef',
                    select: null,
                    model: 'Customer'
                },{
                    path: 'brokerRef',
                    select: null,
                    model: 'Broker'
                },{
                    path: 'agentRef',
                    select: null,
                    model: 'Broker'
                }]
            })
        .populate('orderRef')
        .exec(function(err,reorder){
            next(reorder);
        })
}

module.exports.add = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Order.findById(req.body.orderRef)
            .exec(function(err,order){
                req.$injection.order = order;
                next();
            })
        },
        (req, res, next) => {
            const order = req.$injection.order;
            const reorder = new Reorder({
                createrRef : req.$injection.staff.id,
                customerRef : order.customerRef,
                brokerRef : order.brokerRef,
                agentRef : order.agentRef,
                originOrderRef : order._id
            })
            
            reorder.save(function(err){
                _findOrderById(reorder.id,function(reorder){
                    res.$locals.writeData(reorder);
                    next();
                })
            })
        },
    ]
}

module.exports.approve = {
    method : 'post',
    middlewares : [
        validateLoginAsStaff,
        (req, res, next) => {
            Reorder.findById(req.body.reorderRef)
            .populate('originOrderRef')
            .exec(function(err,reorder){
                if(GenericStatus.NORMAL === req.body.status){
                    const originOrder = reorder.originOrderRef;
                    const order = new Order({
                        originOrderRef:originOrder.id,
                        customerRef:originOrder.customerRef,
                        brokerRef:originOrder.brokerRef,
                        agentRef:originOrder.agentRef,
                        createrRef:reorder.createrRef,
                        date : originOrder.date,
                        status : Order.ASSIGNED,
                        num:originOrder.num,
                        item:originOrder.item,
                        liangTi:originOrder.liangTi,
                        luTaiMianLiaoRef : originOrder.luTaiMianLiaoRef,
                        keGongMianLiao : originOrder.keGongMianLiao,
                        peiSeMianLiaoRef : originOrder.peiSeMianLiaoRef,
                        peiSeBuWei:originOrder.peiSeBuWei,
                        receiveAddress:originOrder.receiveAddress
                    });
                    order.save(function(err){
                        reorder.orderRef = order._id;
                        req.$injection.reorder = reorder;
                        next();
                    })
                }else{
                    req.$injection.reorder = reorder;
                    next()
                }
            })
            
        },
        (req, res, next) => {
            let reorder = req.$injection.reorder;
            reorder.status = req.body.status;
            reorder.approverRef = req.$injection.staff.id;
            reorder.approveDate = new Date();
            reorder.save(function(err){
                _findOrderById(reorder.id,function(reorder){
                    res.$locals.writeData(reorder);
                    next();
                })
            });
        }
    ]
}