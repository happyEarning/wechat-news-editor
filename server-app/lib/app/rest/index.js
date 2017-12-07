const Excel = require('exceljs'),
		Moment = require('moment'),
		async = require('async'),
		Fs = require('fs'),
        Path = require('path'),
        config = require('../../config');

const masterModelPermission = require('./options/masterModelPermission')
const validateUpdatedAt = require('./options/validateUpdatedAt')

const _mergeOptions = (...optionsArr) => {
  const merged = {}
  optionsArr.forEach(options => {
    for (let key in options) {
      let value = options[key]
      if (key.indexOf('pre') === 0 || key.indexOf('post') === 0) {
        merged[key] = merged[key] || []
        merged[key].push(value)
      } else {
        merged[key] = value
      }
    }
  })
  for (let key in merged) {
    let value = merged[key]
    if (key.indexOf('pre') === 0 || key.indexOf('post') === 0) {
      (() => {
        merged[key] = (req, res, next) => {
          async.series(value.map(middleware => {
            return next => {
              middleware(req, res, next)
            }
          }), next)
        }
      })(value)
    }
  }
  return merged
}


module.exports = {
    pictures : {model : require('../../models/Picture'),options: _mergeOptions(validateUpdatedAt())},
    customers : {model : require('../../models/Customer'),options: _mergeOptions(validateUpdatedAt())},
    news : {model : require('../../models/News'),options: _mergeOptions(validateUpdatedAt())},
    fabrics : {model : require('../../models/Fabric'),options: _mergeOptions(validateUpdatedAt())},
    orders : {model : require('../../models/Order'),options: _mergeOptions(validateUpdatedAt())},
    summaries : {model : require('../../models/Summary'),options: _mergeOptions(validateUpdatedAt())},
    factorys : {model : require('../../models/Factory'),options: _mergeOptions(validateUpdatedAt())},
    staffs : {model : require('../../models/Staff'),options: _mergeOptions(validateUpdatedAt())},
    payments : {model : require('../../models/Payment'),options: _mergeOptions(validateUpdatedAt())},
    orderExcels : {
    	model : require('../../models/Order'),
    	options:{
    		postRead : function (req, res, next) {
			  	const result = req.erm.result         // unfiltered document, object or array
			  	const statusCode = req.erm.statusCode // 200
			  	if(result.length > 0){
			  		const now = Moment().format('YYYYMMDDHHmmssSSS');
            		const filename = config.download.tmpDir + config.download.orderFilenamePrefix + now + '.xlsx';
            		req.$injection.filename = filename;
			  		_createDownloadFile(result,filename,next);
			  	}else{
			  		next(new Error('没有数据导出'));
			  		return;
			  	}
			  	
			},
			outputFn: function (req, res) {
			  	const result = req.erm.result         // filtered object
			  	const statusCode = req.erm.statusCode // 200 or 201
			  	res.on('finish', function() {
		            Fs.unlink(req.$injection.filename);
		        })
		        res.download(req.$injection.filename, Path.parse(req.$injection.filename).base);
			}
    	}
    	
    },
    reorders : {model : require('../../models/Reorder'),options: _mergeOptions(validateUpdatedAt())},
    sizes : {model : require('../../models/Size'),options: _mergeOptions(validateUpdatedAt())},
    tags : {model : require('../../models/Tag'),options: _mergeOptions(validateUpdatedAt())},
    informations : {model : require('../../models/Information'),options: _mergeOptions(validateUpdatedAt())},
    brokers : {model : require('../../models/Broker'),options: _mergeOptions(validateUpdatedAt())}
};

_createDownloadFile = (orders,filename, next) =>{
    const Order = require('../../models/Order')
    let workbook = new Excel.Workbook();
    let sheet = workbook.addWorksheet('预约单');
    sheet.columns = [
        { header: '预约单编号', key: 'no', width: 10 },
        { header: '客户', key: 'customerName', width: 10 },
        { header: '客户手机号', key: 'customerMobile', width: 20 },
        { header: '量体地址', key: 'liangTiAddress', width: 40 },
        { header: '商品', key: 'item', width: 20 },
        { header: '数量', key: 'num', width: 10 },
        { header: '预约日期', key: 'date', width: 20 },
        { header: '合伙人', key: 'broker', width: 20 },
        { header: '代理人', key: 'agent', width: 20 },
        { header: '量体日期', key: 'liangTiDate', width: 20 },
        { header: '支付日期', key: 'paymentDate', width: 20 },
        { header: '状态', key: 'customer', width: 20 }
    ];
    const rows = orders.map(function(order){
        const customerRef = order.customerRef;
        const liangTi = order.liangTi;
        let orderDate = '';
        if(order.date){
            orderDate = Moment(order.date).format('YYYY-MM-DD');
        }
        let paymentDate = '';
        if(order.paymentDate){
            paymentDate = Moment(order.paymentDate).format('YYYY-MM-DD');
        }
        let liangTiDate = '';
        if(liangTi.date){
            liangTiDate = Moment(liangTi.date).format('YYYY-MM-DD');
        }
        return [
            order.no,
            customerRef?customerRef.name:'',
            customerRef?customerRef.mobile:'',
            liangTi.address?liangTi.address.province + liangTi.address.city + liangTi.address.detail:'',
            order.item,
            order.num,
            orderDate,
            order.brokerRef?order.brokerRef.name:'',
            order.agentRef?order.agentRef.name:'',
            liangTiDate,
            paymentDate,
            _getStatus(order,Order)
            ];
    })
    sheet.addRows(rows);
    workbook.xlsx.writeFile(filename).then(next);
};

_getStatus = (doc,Order) => {
    if(doc.status === Order.WAITING_ASSIGN){
        return '待分配';
    }else if(doc.status === Order.ASSIGNED){
        return '已分配';
    }else if(doc.status === Order.PAID){
        return '已量体支付';
    }else if(doc.status === Order.SENT_FACTORY){
        return '已发送至工厂';
    }else if(doc.status === Order.DISPATCHING){
        return '配送中';
    }else if(doc.status === Order.SIGNED){
        return '已签收';
    }else if(doc.status === Order.WAITING_REORDER_REVIEW){
        return '待审核重做';
    }else if(doc.status === Order.REORDERED){
        return '已重做';
    }else if(doc.status === Order.COMPLETE){
        return '已完成';
    }else{
        return '';
    }
}