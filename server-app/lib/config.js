const fs = require('fs'),
    path = require('path');

module.exports = (function(prod) {
    var config = {
        prod : prod,
        root : __dirname,
        // db
        db : {
            // url : prod ? 'tailor.xxxxx.com' : 'tailor-dev.xxxxx.com',
            url : 'localhost',
            port : 27017,
            schema : 'wechat',
            user : 'wechat',
            password : '123456',
            poolSize : 25
        },
        // log
        log : {
            db : {
                // url : prod ? 'tailor.xxxxx.com' : 'tailor-dev.xxxxx.com',
                url : 'localhost',
                port : 27017,
                schema : 'wechat-logger',
                user : 'wechatlog',
                password : '123456',
                // A workaround for mongodb native driver. https://github.com/nodejs/node/issues/7776
                poolSize : 1
            }
        },
        // Express server
        app : {
            port : 30001,
            cookieSecret : 'cookieSecret',
            sessionSecret : 'sessionSecret'
        },
        sms : {
            captchaBackdoor : '9999'
        },
        wechat : {
            appId : 'wxd1c4877c0eb94ab2',
            appSecret : '76fa5da4f8fd458a9bba628e91726017',
            token : 'AfGRQ5jO',
            aesKey : 'MOT9zTN1ZzKPh5CNmVyY78mixDa46ZYsKNx6tDVhz1h'
        },
        ehking : {
            url : 'http://tailor.xxxxx.com/ehking/joint/',
            //url : 'http://localhost:8080/ehking-sdk-java-joint/joint/',
            merchantId : '120143031',
            queryJointaccount:'queryJointaccount',      //子账户信息查询
            createJointaccount:'createJointaccount',     //创建子账户
            jointSettlementProfile:'jointSettlementProfile',     //新增修改结算账户
            jointTransferOrderCreate:'jointTransferOrderCreate'     //主对子账户间转账
        },
        onlinepay : {
            url : 'http://tailor.xxxxx.com/onlinepay/onlinepay/',
            //url : 'http://localhost:8080/ehking-sdk-java-OnlinePay/onlinepay/',
            notifyUrl:'http://tailor.xxxxx.com/onlinepay/onlinepay/notify',
            merchantId : '120143031',
            order:'order',      //下单
        },
        qiniu : {
            accessKey : '_frF3g2xP6S02Nl0gSNk5kiqJFMtWSR6tIz_6le4',
            secretKey : 'A35xhHuq2N3iVhJAqiy-vMzPW7RaoihSNFtjQN6j',
            scope:'tailor-images',
            baseUrl:'http://tailor-images.xxxxx.com/'
        },
        yunpian : {
            apiKey : '5a36aa4fd063a06bf31197c105dc26a8',
            templates : {
                login : {
                    captcha : "【真裁时料】您的验证码是<%= captcha %>"
                }
            },
            enabled : true
        },
        aliyun : {
            accessKeyId : 'LTAIxHUqPNJuc7ca',
            accessKeySecret : 'MRxxPxtgGLGnjOX8KQPQtl4JJHNQZM'
        },
        attachmentTemplete : {
            //shirtMan : 'E:/tailor/git/template/真裁时料（男）下单表.xlsx',
            //shirtWomen : 'E:/tailor/git/template/真裁时料（女）下单表.xlsx'
            shirtMan : '/home/tailor/template/真裁时料（男）下单表.xlsx',
            shirtWomen : '/home/tailor/template/真裁时料（女）下单表.xlsx'
        },
        mail : {
            host : 'smtp.mxhichina.com', 
            port: 465,
            authUser:'tailor@zcsl100.com',
            password: '1q2w3e4r@',
            mailFrom : '"真裁时料" <tailor@zcsl100.com>',
            mailTo : '80932158@qq.com'
        },
        download: {
            tmpDir: '/home/tailor/tmp/',
            //tmpDir : 'E:/tailor/tmp/',
            orderFilenamePrefix:'预约单'
        }
    };
    return config;
})(process.argv.indexOf('prod') !== -1);
