
const Picture = require('../../models/Picture');
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    console.log('file-message',file)
    let fileType = ''
    if(file.mimetype=='image/jpeg'){
      fileType = '.jpg'
    }
    if(file.mimetype=='image/png'){
      fileType = '.png'
    }
    cb(null, file.fieldname + '-' + Date.now()+fileType)
  }
})

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
      if(req.file.filename){
        next();
      }else{
        next();
      } 
    },
    (req, res, next) => {
      // 保存图片地址进库 返回给前端参数   
      
      // let picture = new Picture({
      //   name: '123'
      // })
      // picture.save(err => {
      //   res.$locals.writeData({ picture });
      //   next();
      // });

      res.$locals.writeData({ aa:'11111' });
      next();
    }
  ]
}
// 保存推文
module.exports.saveArticle = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      // 处理推文 图片换成微信服务器地址 
      next();
    },
    (req, res, next) => {
      // 保存推文到本地  
      next();
    },
    (req, res, next) => {
      // 返回给前端    
      next();
    }
  ]
}
// 发送推文 
module.exports.saveArticle = {
  method: 'post',
  middlewares: [
    (req, res, next) => {
      // 发送推文 
      next();
    },
    (req, res, next) => {
      // 返回给前端结果  
      next();
    }
  ]
}

