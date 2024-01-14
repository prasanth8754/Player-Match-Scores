const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
app.use(express.json())

// initialize and connect database...
let db = null

const initializeDBAndConnectDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}
initializeDBAndConnectDatabase()

// Returns a list of all the players in the player table

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT 
  player_id as playerId,
  player_name as playerName
  FROM 
  player_details
  ;`

  const playersList = await db.all(getPlayersQuery)
  response.send(playersList)
})

// Returns a specific player based on the player ID

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT 
  player_id as playerId,
  player_name as playerName
  FROM 
  player_details
  WHERE player_id = ${playerId};`

  const player = await db.all(getPlayerQuery)
  response.send(player[0])
})

//Updates the details of a specific player based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
  UPDATE
  player_details
  SET player_name = "${playerName}"
  WHERE player_id = ${playerId};`

  await db.all(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Returns the match details of a specific match

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchDetailsQuery = `
  SELECT 
  match_id as matchId,
  match,year
  FROM 
  match_details
  WHERE match_id = ${matchId};`

  const matchDetails = await db.all(getMatchDetailsQuery)
  response.send(matchDetails[0])
})

//Returns a list of all the matches of a player

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params

  const getMatchDetailsQuery = `
  SELECT 
  match_details.match_id as matchId,
  match,year
  FROM 
  match_details
  INNER JOIN player_match_score
  ON match_details.match_id = player_match_score.match_id
  WHERE player_match_score.player_id = ${playerId};`

  const matchDetails = await db.all(getMatchDetailsQuery)
  response.send(matchDetails)
})

// Returns a list of players of a specific match

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params

  const getPlayersListQuery = `
  SELECT 
  player_details.player_id as playerId,
  player_details.player_name as playerName
  FROM 
  player_details
  INNER JOIN player_match_score
  ON player_details.player_id = player_match_score.player_id
  WHERE player_match_score.match_id = ${matchId};`

  const playerDetails = await db.all(getPlayersListQuery)
  response.send(playerDetails)
})

//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params

  const getStatisticsQuery = `
  SELECT 
  player_details.player_id as playerId,
  player_details.player_name as playerName,
  SUM(player_match_score.score) as totalScore,
  SUM(player_match_score.fours) as totalFours,
  SUM(player_match_score.sixes) as totalSixes
  FROM 
  player_details
  INNER JOIN player_match_score
  ON player_details.player_id = player_match_score.player_id
  WHERE player_details.player_id = ${playerId};`

  const statistics = await db.all(getStatisticsQuery)
  response.send(statistics[0])
})

module.exports = app
