const express = require('express')
const app = express()

app.use(express.json())
app.use('/', express.static(`${__dirname}/public`))
app.get('/', (_req, res) => res.sendFile(`${__dirname}/public/index.html`))
app.use('/api', require('./api/api'))

app.listen(process.env.PORT || 3000, () => console.log('started'))