const fetch = require('node-fetch');

const url = process.env.MOURO ? process.env.MOURO : 'https://edge.uport.me'
const uri = url + '/graphql'
const query = "mutation{addEdge(edgeJWT: \"{edgeJWT}\"){hash,jwt,from {did},to{did},type,time,visibility,retention,tag,data}}"


function addEdge(jwt) {
  let data = {
    query: query.replace('{edgeJWT}', jwt)
  }

  console.log(data)
  return fetch(uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()).then(json => {
    let data = json.data
    console.log('hash [' + data.addEdge.hash + ']')
  })
}

module.exports = { addEdge }