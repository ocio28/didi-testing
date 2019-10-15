const fs = require('fs')
const { Credentials } = require('uport-credentials');
const EthrDID = require('ethr-did')
const { createVerifiableCredential } = require('did-jwt-vc')
const randomstring = require('randomstring')

const { addEdge } = require('./Mouro')
const cursos = require('./courses.json')

const vcissuer = new EthrDID({
  address: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
  privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
})

//TODO por parametros
//let accion = process.argv[2]
let cantidad = parseInt(process.argv[2], 10)

console.log(cantidad)
if (!isNaN(cantidad)) {
  fs.mkdir('./identidades', () => crearIdentidades(cantidad))
}


function crearIdentidades(cantidad = 10) {
  let identidades = []
  for (let i = 0; i < cantidad; i++) {
    identidades.push(Credentials.createIdentity())
  }

  let datosCredenciales = identidades.map(identidad => {
    let curso = cursos[rng(0, cursos.length)]
    return {
      did: identidad.did,
      nombre: 'Pedro' + randomstring.generate(rng(2, 4)),
      apellido: 'Picapiedras' + randomstring.generate(rng(2, 4)),
      curso: curso.nombre,
      duracion: curso.duracion,
      fecha_fin: curso.fecha_fin
    }
  })

  //console.log(datosCredenciales)
  identidades.forEach(guardarIdentidades)
  fs.writeFile('./datos_credenciales.json', JSON.stringify(datosCredenciales), res => {
    console.log('datos_credenciales', res)
  })

  datosCredenciales.forEach(generarCredencial)
}

function generarCredencial(data) {
  const fullPayload = vc({
    didiserver: {
      nombre: data.nombre,
      apellido: data.apellido,
      curso: data.curso,
      duracion: data.duracion,
      fecha_fin: data.fecha_fin,
      formato: 'vc'
    }
  })

  const identidadPayload = vc({
    didiserver_identidad: {
      nombre: data.nombre,
      apellido: data.apellido,
      formato: 'vc'
    }
  })
  const cursoPayload = vc({
    didiserver_curso: {
      curso: data.curso,
      duracion: data.duracion,
      fecha_fin: data.fecha_fin,
      formato: 'vc'
    }
  })

  createVerifiableCredential(fullPayload, vcissuer).then(addEdge).catch(console.error)
  createVerifiableCredential(identidadPayload, vcissuer).then(addEdge).catch(console.error)
  createVerifiableCredential(cursoPayload, vcissuer).then(addEdge).catch(console.error)
}
/*
function mouroAddEdge(jwt) {
  hash_mouro = addEdge(jwt)
  console.log(hash_mouro)
}*/

function vc(credentialSubject)  {
  return {
    sub: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
    nbf: 1562950282,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject
      }
    }
}

function guardarIdentidades(data) {
  fs.writeFile('./identidades/{}.json'.replace('{}', data.did), JSON.stringify(data), res => {
    console.log('write file', res)
  })
}

function rng(min, max) {
  return Math.floor((Math.random() * max) + min)
}