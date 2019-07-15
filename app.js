const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3000


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

//showing README file for instructions
app.get('/',function(req,response) {
    response.sendFile('README.md', { root: '.' })
})

app.get('/nodes', db.getNodes)
app.get('/node/:id', db.getNodeById)
app.get('/children/:id', db.getChildrenById)
app.get('/descendants/:id', db.getDescendantsById)
app.put('/nodes/:id', db.updateNode)
app.post('/nodes', db.createNode)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
