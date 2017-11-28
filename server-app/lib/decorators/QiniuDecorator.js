const qiniu = require('qiniu'),
    async = require('async'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

const config = require('../config'),
    {accessKey, secretKey} = config.qiniu,
    RequestDecorator = require('./RequestDecorator');

/**
 * https://developer.qiniu.com/kodo/sdk/1289/nodejs
 */
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

const calcUploadToken = (bucket) => {
    var putPolicy = new qiniu.rs.PutPolicy({
        scope : bucket.name,
        expires : 7200
    });
    return putPolicy.uploadToken(mac);
}

const upload = (localFile, bucket, next) => {
    const formUploader = new qiniu.form_up.FormUploader(),
        putExtra = new qiniu.form_up.PutExtra(),
        key = null;
    formUploader.putFile(calcUploadToken(bucket), key, localFile, putExtra, function(err, body, info) {
        if (err) {
            next(err)
        }
        if (info.statusCode == 200) {
            next(null, bucket.baseUrl + body.key)
        } else {
            next(new Error(`文件上传失败，七牛 ${info.statusCode}`));
        }
    });
};

module.exports = {
    calcUploadToken,
    upload
}
