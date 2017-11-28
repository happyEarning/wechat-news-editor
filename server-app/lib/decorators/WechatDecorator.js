const async = require('async'),
User = require('../models/User'),
    WechatAPI = require('wechat-api'),
    log = require('../runtime/log'),
    logger = log.byJs(__filename);

const config = require('../config');


const userTagging = (openid,targetTag,next) => {
    const api = new WechatAPI(config.wechat.appId, config.wechat.appSecret);
    const openids = [openid];
    api.getUserTags(openid,(err,result)=>{
        if(err){
            logger.info('getUserTags_error_openid:'+openid,result);
            next();
        }else{
            async.series(result.tagid_list.map(tag=>{
                return callback => {
                    if(tag === 101 || tag === 102 || tag === 103){
                        api.membersBatchuntagging(tag,openids,(err,result)=>{
                            if(err){
                                logger.info('clearUserTags_error_openid:'+openid + '_tag:'+tag,result.errmsg);
                                callback(err,result);
                            }else{
                                callback();
                            }
                        });
                    }else{
                        callback();
                    }
                }
            }),(err,result)=>{
                if(err){
                    next();
                }else{
                    if(targetTag){
                        api.membersBatchtagging(targetTag,openids,(err,result)=>{
                            if(err){
                                logger.info('tag_error_openid:' + openid,err);
                                next();
                            }else{
                                next();
                            }
                        })
                    }else{
                        next();
                    }
                }
            })
        }
    })
}

module.exports = {
    userTagging
}
