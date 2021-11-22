const express = require('express')
const basicAuth = require('express-basic-auth')
const next = require('next')
require('dotenv').config()


const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.all('/admin*', basicAuth({ users: { 'kawee': 'cheew8' }, challenge: true }))

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })  