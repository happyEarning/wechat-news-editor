const preWrite = function (req, res, next) {
  if (req.$session.getStaffRef()) {
    next()
  } else {
    next(new Error('权限校验失败'))
  }
}

module.exports = () => {
  return {
    preCreate: preWrite,
    preUpdate: preWrite,
    preDelete: preWrite
  }
}
