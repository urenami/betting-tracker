var express = require('express')
var path = require('path')
var logger = require('morgan')

var picksRouter = require('./routes/picks')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Serve your static front-end
app.use(express.static(path.join(__dirname, 'public')))

// Your API route
app.use('/picks', picksRouter)

// 404 handler
app.use(function(req, res, next) {
  res.status(404).json({ message: 'Not Found' })
})

// General error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  })
})

module.exports = app
