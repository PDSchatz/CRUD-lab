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
  if (friend === 'N' || friend === 'n') {
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

async function read() {
  let robots = await Robot.find({})
  robots.forEach(robot => console.table(robot.toObject()))
}

async function updateRobot() {
  console.clear()
  console.log(`please select a robot by name: `)
  let robots = await Robot.find({},{robotName: 1})
  robots.forEach(robot => console.table(robot.toObject()))
  await ask(`> `)
    .then( async selectedBot => await Robot.findOne({ robotName: selectedBot }))
    .then( async (robot) => {
      console.log(`selected the field to modify: `)
      console.table(robot.toObject())
      let selectedField = await ask(`$> `)
      return {
        selectedField,
        robot
      }
    })
    .then( async (selectedFieldAndBot) => {
      if(Object.keys(selectedFieldAndBot.robot.toObject()).includes(selectedFieldAndBot.selectedField.trim())){
        let changeTo = await ask(`what do you want "${selectedFieldAndBot.selectedField}" to become?\n$> `)
        const changedField = {}
        changedField[selectedFieldAndBot.selectedField] = changeTo
        let updatedBot = await Robot.findOneAndUpdate(selectedFieldAndBot.robot, changedField)
        if(updatedBot){
          console.log(`bot has been updated!`)
        }
      }
    })
}

async function deleteRobot() {
  console.clear();
  console.log(`select a robot to delete by name: `)
  let robots = await Robot.find({},{robotName: 1})
  robots.forEach(robot => console.table(robot.toObject()))
  await ask(`> `)
    .then(async (selectedRobotName) => {
      let deletedBot = await Robot.findOneAndDelete({robotName: selectedRobotName})
      if(deletedBot){
        console.log(`robot "${deletedBot.robotName}" deleted`)
      } else {
        'cant find a bot by that name'
      }
    })
}


async function start(){
  let action = await ask(`Welcome to the robot factory! What do you want to do? \n\n(Create, Read, Update, Delete) $>  `)
  
  try {
    switch (action.toLowerCase()) {
      case 'c':
      case 'create':
        await create()
        break;
      case 'r':
      case 'read':
        await read()
        break;
      case 'u':
      case 'update':
        await updateRobot()
        break;
      case 'd':
      case 'delete':
        await deleteRobot()
        break;
      case 'q':
      case 'quit':
        process.exit()
        break;
      default:
        console.log(`input not found... `)
        start()
        break;
    }
  } catch (error) {
    console.log(`error encountered: ${error}`)
    console.log(`please selection an action: `)
    start()
  }
  start()
}

app.listen(process.env.PORT, () => {
  console.log(`now listening on port: `, process.env.PORT)
  start()
})