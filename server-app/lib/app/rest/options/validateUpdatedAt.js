module.exports = () => {
  return {
    preUpdate: (req, res, next) => {
      if(req.body.updatedAt && req.erm.document.updatedAt.getTime() !== new Date(req.body.updatedAt).getTime()){
        next(new Error('当前画面数据已经被更新，请重新打开。'))
      }else{
        next()
      }
    }
  }
}
