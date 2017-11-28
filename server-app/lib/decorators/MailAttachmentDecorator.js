const async = require('async'),
    _ = require('lodash'),
    Fs = require('fs'),
    moment = require('moment'),
    Excel = require('exceljs'),
    config = require('../config'),
    ShirtExcelDecorator = require('./ShirtExcelDecorator'),
    path = require('path');

var _pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

const createSummaryMailAttachment = (req,res,next) => {
    const Order = require('../models/Order');
    const orderRefs = req.body.summary.orderRefs;
    let attachments = [];
    let templateFilePath;
    if(req.body.summary.item == '男衬衫'){
        templateFilePath = config.attachmentTemplete.shirtMan;
    }else{
        templateFilePath = config.attachmentTemplete.shirtWomen;
    }
    async.series(orderRefs.map(orderRef=>{
        return callback=>{
            Order.findById(orderRef._id)
            .populate('createrRef')
            .populate('customerRef')
            .populate('brokerRef')
            .populate('agentRef')
            .populate('liangTi.sizeRef')
            .populate('approverRef')
            .populate('liangTi.sizeRef')
            .populate('luTaiMianLiaoRef')
            .populate('peiSeMianLiaoRef')
            .exec((err,order)=>{
                if(order){
                    const factoryNoPrefix = '702' + moment().format('YYMMDD') + '-';
                    Order.findOne({
                        factoryNo:{$regex:factoryNoPrefix,$options:'i'}
                    })
                    .sort({factoryNo:-1})
                    .exec((err,orderForNo)=>{
                        let cnt = 1;
                        if(orderForNo){
                            console.log(orderForNo.factoryNo.substring(10));
                            cnt = parseInt(orderForNo.factoryNo.substring(10)) + 1;
                        }
                        order.factoryNo = factoryNoPrefix + _pad(cnt,3)
                        var workbook = new Excel.Workbook();
                        workbook.xlsx.readFile(templateFilePath)
                        .then(function() {
                            const attachment = config.download.tmpDir + order.no + '.xlsx';
                            attachments.push({
                                filename:order.no + '.xlsx',
                                path:attachment
                            })
                            let ordersheet = workbook.getWorksheet('下单表');
                            let sizesheet = workbook.getWorksheet('号衣尺寸');
                            //var xlsx = XLSX.readFile(templateFilePath,{raw:true,cellStyles:true});
                            //XLSX.writeFile(xlsx,  config.download.tmpDir +'test.xlsx'); 
                            ShirtExcelDecorator.fillShirtExcel(ordersheet,order);
                            
                            if(req.body.summary.item == '男衬衫'){
                                workbook.views[0].activeTab = 0;
                            }
                            
                            workbook.xlsx.writeFile(attachment)
                            .then(err=>{
                                order.save(callback)
                            });
                        });
                    })
                }else{
                    callback();
                }
                
            })
        }
    }),(err,result)=>{
        if(err){
            async.series(orderRefs.map(orderRef=>{
                return callback=>{
                    const file = config.download.tmpDir + order.no + '.xlsx';
                    if(Fs.existsSync(file)){
                        Fs.unlink(file, callback);
                    }else{
                        callback();
                    }
                }
            }),(error,result)=>{
                next(err);
                return;
            })
        }else{
            req.$injection.attachments = attachments;
            next();
        }
    })
}

module.exports = {
    createSummaryMailAttachment
}
