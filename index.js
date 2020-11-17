const express = require('express')
const pathToFfmpeg = require('ffmpeg-static')
const path = require('path')
const app = express()

process.env.PATH = `${process.env.PATH}:${path.dirname(pathToFfmpeg)}`

app.use(express.json())
app.use('/', express.static(`${__dirname}/public`))
app.get('/', (_req, res) => res.sendFile(`${__dirname}/public/index.html`))
app.use('/api', require('./api/api'))

app.listen(process.env.PORT || 3000, () => { })