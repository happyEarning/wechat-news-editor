const log = require('../../runtime/log')

module.exports = schema => {
  schema.post('init', function (doc, next) {
    doc._initJSON = doc.toJSON({depopulate: true})
    next()
  })
  schema.post('save', function (doc, next) {
    const logger = log.byCategory(`trace ${doc.collection.name}`)
    logger.info(`${doc.id}`, {
      from: doc._initJSON,
      to: doc.toJSON({depopulate: true})
    })
    next()
  })
}
