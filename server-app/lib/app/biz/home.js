
const Picture = require('../../models/Picture');
const News = require('../../models/News');
var multer = require('multer')
var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    let fileType = ''
    if (file.mimetype == 'image/jpeg') {
      fileType = '.jpg'
    }
    if (file.mimetype == 'image/png') {
      fileType = '.png'
    }
    cb(null, file.fieldname + '-' + Date.now() + fileType)
  }
})

var wechat = require('wechat');
// wx8f0d7ab4eaa56495
// 05731f4019b5c8e0187cbebd7bf7d843
var config = {
  token: 'tokenaccesskey',
  appid: 'wx8f0d7ab4eaa56495',
  encodingAESKey: 'encodinAESKey',
  checkSignature: false // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

var API = require('wechat-api');
var api = new API('wx8f0d7ab4eaa56495', '05731f4019b5c8e0187cbebd7bf7d843');

var upload = multer({ storage: storage })

module.exports.index = {
  method: 'get',
  middlewares: [
    (req, res, next) => {
      let picture = new Picture({
        wxUrl: 'http://wx.qq.com/image-1511832871715.jpg',
        url: 'http://localhost:8005/image-1511832871715.jpg'
      })
      picture.save(err => {
        res.$locals.writeData({ picture });
        next();
      });
      // next(new Error('代理人子账号申请失败:'));
    }
  ]
}

module.exports.uploadImg = {
  method: 'post',
  middlewares: [
    upload.single('image'),
    (req, res, next) => {
      // 上传到微信服务器   
      if (req.file.filename) {
        let filePath = './uploads/' + req.file.filename;
        api.uploadImage(filePath, function (err, result) {
          let picture = new Picture({
            wxUrl: result.url,
            url: req.file.filename,
            type: 'image'
          })
          picture.save(err => {
            res.$locals.writeData({ picture });
            next();
          });
        });
      } else {
        next();
      }
    },
  ]
}

module.exports.uploadImg2 = {
  method: 'post',
  middlewares: [
    upload.single('image'),
    (req, res, next) => {
      // 上传到微信服务器   
      if (req.file.filename) {
        let filePath = './uploads/' + req.file.filename;
        api.uploadMedia(filePath, 'image', function (err, result) {
          if (err) {
            next(new Error('上传至微信图片出错'));
          } else {
            let picture = new Picture({
              mediaId: result.media_id,
              url: req.file.filename,
              type: 'media'
            })
            picture.save(err => {
              res.$locals.writeData({ picture });
              next();
            });
          }

        });
      } else {
        next();
      }
    },
  ]
}
// 保存推文
module.exports.saveArticle = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      let teList = req.body
      let news = []
      teList.forEach(item => {
        let newsContent = item.content
        var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/gi;
        let imgResults = newsContent.match(srcReg)
        if(imgResults && imgResults instanceof Array ){
          imgResults.forEach(item => {
            let splitSrc = item.split('=')
            if (splitSrc[1]) {
              let splitUrl = splitSrc[1].split('?')
              if (splitUrl[1]) {
                let wxImgUrl = decodeURIComponent(splitUrl[1]).replace(/"/g, '')
                let originUrl = splitSrc[1].replace(/"/g, '')
                newsContent = newsContent.replace(originUrl, wxImgUrl)
              }
            }
          })
        }
        
        let content = newsContent
        let newsItem = {
          thumb_media_id: item.thumb_media_id || '',
          author: item.author || '',
          title: item.title,
          content_source_url: item.content_source_url || '',
          content: content,
          digest: item.digest || '',
          show_cover_pic: "0",
        }
        news.push(newsItem)
      })

      let newsData = new News({
        articles: teList,
      })
      // // save
      req.$injection.articles =  {
        "articles": news
      }
      req.$injection.newsData =  newsData
      next();
    },
    (req, res, next) => {
      // 保存推文到本地  
      const result = api.uploadNews(req.$injection.articles, function (err, result) {
        console.log(err)
        console.log(result)
        // save result.media_id
        req.$injection.newsData.mediaId = result.media_id
        req.$injection.newsData.save(
          err => {
            res.$locals.writeData(req.$injection.newsData);
            next();
          }
        )

        // next();
      });
      // next();
    },
    (req, res, next) => {
      // 返回给前端   
      // Save News in Server 
      next();
    }
  ]
}
// 发送推文 
module.exports.sendNews = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      // 发送推文 
      // 查询素材信息
      const mediaId = req.body.media_id;
      if(mediaId){
        const receivers = 'o7vwNt4wyHsv5hwZE0VZWHRNRHYE';
        const result = api.previewNews( receivers, mediaId,function (err,result) {
          next()
        });
        // const result = api.massSendNews(mediaId, receivers, function (err,result) {
        //   console.log(err)
        //   console.log(result)
        //   next()
        // });
      }else{
        next(new Error('模版id不存在'))
      }

    },
    (req, res, next) => {
      // 返回给前端结果  
      next();
    }
  ]
}
// wechat
module.exports.wechat = {
  method: 'all',
  middlewares: [
    (req, res, next) => {
      console.log('aaaaa')
      // 发送推文 
      next();
    },
    wechat('tokenaccesskey', function (req, res, next) {
      // 微信输入信息都在req.weixin上
      var message = req.weixin;
      res.reply('hehe');
    })
  ]
}

// wechat 发送消息
module.exports.wechat2 = {
  method: 'all',
  middlewares: [
    (req, res, next) => {
      console.log('发送消息')
      // 发送推文 
      api.massSendText('Hello world', 'o7vwNt4wyHsv5hwZE0VZWHRNRHYE', (data, a, b) => {
        console.log(data, a, b)
        next();
      });
    }
  ]
}

// * uploadMsg(ctx) {
//   const wechatApi = yield this.getApi();
//   const data = {
//     thumb_url: ctx.thumb_url,
//     author: ctx.author,
//     title: ctx.title,
//     content: ctx.content,
//     digest: ctx.digest,
//   }
//   // 保存推文
//   const tweet = new this.ctx.model.Tweet(data);
//   tweet.save();
//   console.log(tweet);
//   const news = {
//     thumb_media_id: ctx.thumb_media_id,
//     author: ctx.author,
//     title: ctx.title,
//     content_source_url: "http://wx.luciferchina.com/#/article/" + tweet._id,
//     content: ctx.content1,
//     digest: ctx.digest,
//     show_cover_pic: "0",
//   }
//   const articles = {
//     "articles": [news ]
//   }
//   const result = yield* wechatApi.uploadNews(articles);
//   return JSON.parse(result.toString());
// }

/**
 * 发送消息
 */

// * sentOutMsg(query) {
//   const uploadMsg = yield this.uploadMsg(query);
//   const wechatApi = yield this.getApi();
//   // const receivers = [
//   //   "oer9hxFaIfjTbHlSko9ChoCYhsDo",
//   //   "oer9hxJpGvIeznCPBXq9_n-fZJ9U",
//   // ];
//   const mediaId = uploadMsg.media_id;
//   const receivers = true;
//   const result = yield* wechatApi.massSendNews(mediaId, receivers);
//   // 保存消息发送记录
//   const data = {
//     mediaId: mediaId,
//     author: query.author,
//     type: 'news',
//     receivers: receivers,
//   };
//   const tweetlog = new this.ctx.model.Tweetlog(data);
//   tweetlog.save();
//   return result;
// }