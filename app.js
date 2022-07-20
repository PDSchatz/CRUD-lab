require('dotenv').config()
const express = require('express')
const app = express()

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_STRING)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
const Robot = require('./CRUD')

const readline = require('readline')
const readlineInterface = readline.createInterface(process.stdin, process.stdout)
function ask(questionText) {
  return new Promise((res, _) => {
    readlineInterface.question(questionText, res)
  })
}

async function create(){
  let creatorName = await ask('Who is the creator?')
  let robotName = await ask('Designate this robot?')
  let robotColor = await ask('What color is this robot?')
  let friend = await ask('Is this robot a friend? Enter Y or N')
  let killer
  if (friend === 'N') {
    friend = false
    killer = true
    console.log('Oh no! A killer robot!')
  } else {
    friend = true
    killer = false
  }
  let serialNumber = await ask('What is the serial number?')
  let date = new Date()

  const response = new Robot({
    creatorName,
    robotName,
    robotColor,
    friend,
    killer,
    serialNumber,
    date
  })

  await response.save()
  console.log(`robot number ${serialNumber} created!`)
}


async function start(){
  let action = await ask(`Welcome to the robot factory! What do you want to do? \n\n(Create, Read, Update, Delete) $>  `)
  
  try {
    switch (action.toLowerCase()) {
      case 'c':
      case 'create':
        await create()
        break;
    
      default:
        break;
    }
  } catch (error) {
    console.log(`please selection an action: `)
    start()
  }
  start()
}

app.listen(process.env.PORT, () => {
  console.log(`now listening on port: `, process.env.PORT)
  start()
})