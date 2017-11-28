var _ = require('lodash');

module.exports = function(Model, prefix, callback) {
    var doc = this;

    if(!doc.no) {
        _generateNo(Model, prefix, function(err,no){
            doc.no = no;
            callback();
        });
    } else {
        callback();
    }
};

var _generateNo = function(Model, prefix, callback) {
    //var no = prefix + _pad(_.random(1, 100000), 6);
    Model.findOne({}).sort({no:-1})
    .exec(function(err,model){
        let no = 1;
        if(model){
            no = parseInt(model.no.substring(1)) + 1;
        }
        callback(err, prefix + _pad(no, 8));
    })
    /*
    Model.count({
        no : no
    }, function(err, count) {
        if (count) {
            _generateNo(Model, prefix, callback);
        } else {
            callback(err, no);
        }
    })*/
};

var _pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
