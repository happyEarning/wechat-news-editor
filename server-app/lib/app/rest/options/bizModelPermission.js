module.exports = () => {
  return {
    contextFilter: function (model, req, done) {
      if (req.$session.getStaffRef()) {
        return done(model)
      } else {
        return done(model.find({
          userRef: req.$session.getUserRef()
        }))
      }
    }
  }
}
