const EthrDID = require('ethr-did');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const { success, fail, error } = require('./Utils')
const { fetchEdge } = require('./Mouro')

app.use(bodyParser())
app.use("/", express.static(__dirname + '/public'));

app.post('/api/edges', (req, res) => {
  let did = req.body.did
  let key = req.body.key

  if (did === null || key === null) {
    return fail(res, 'did y key son requeridos')
  }
  
  console.log(did, key)
  var vcissuer = new EthrDID({
    address: did,
    privateKey: key
  });

  vcissuer.signJWT({
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // what is a reasonable value here?
  }).then(token => {
    console.log(token);
    //Busca en mouro con did y token generado
    return fetchEdge(did, token)
  }).then(reply => {
    //Respuesta del fetchEdge
    console.log(reply)
    if (reply.errors) {
      let e = reply.errors[0]
      fail(res, (e ? e.message : 'Revisar los logs del servidor'))
    } else {
      success(res, reply.data.findEdges)
    }
  }).catch(e => {
    console.log(e)
    error(res, 'Error interno, revisar logs')
  });
})

app.listen(8099, res => console.log('didi-testing listening 8099'))