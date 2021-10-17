import _ from 'lodash'

const EMPTY_DATA = {
  dayOne: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  dayThree: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  dayTwo: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  name: '',
  ranking: '',

  group: "",
  parDayOne: 0,
  parDayTwo: 0,
  parDayThree: 0,
  parSummary: 0,

  ranking: '',
  releaseGroup: '',
  releaseGroupPosition: '',
  releaseNumber: '',

  shotDayOne: 0,
  shotDayTwo: 0,
  shotDayThree: 0,
  shotSummary: 0,
}

const convertTextData = (textDb) => {
  const row = textDb.split('""')

  const data = row.map(rowData => {
    const splitData = rowData.split('	')
    const userData = {}

    userData.releaseNumber = splitData[0].trim()
    userData.releaseGroup = Number.parseInt(splitData[0].trim().slice(0, -1))
    userData.releaseGroupPosition = Number.parseInt(splitData[0].trim().slice(-1))
    userData.ranking = splitData[1]
    userData.score = splitData[2]
    userData.name = splitData[3]
    if (splitData[3]) {
      userData.name = splitData[3].replace(/"/g, '')
    }
    userData.dayOne = []
    for (const i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]) {
      userData.dayOne.push(splitData[3+i])
    }
    userData.dayTwo = []
    for (const i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]) {
      userData.dayTwo.push(splitData[3+18+i])
    }
    userData.dayThree = []
    for (const i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]) {
      userData.dayThree.push(splitData[3+18+18+i])
    }
    userData.group = splitData[59]
    return userData
  })
  const head = data[0]
  const body = data.slice(1)
  body.pop()

  return {head, body}
}

const mergeRowCaddieData = (mainData, caddieData) => {
  const formatedData = {}
  Object.keys(mainData).forEach(key => {
    if (_.isArray(mainData[key])) {
      formatedData[key] = []
      mainData[key].forEach((hole, index) => {
        if (!+hole) {
          formatedData[key][index] = caddieData[key][index]
        } else {
          formatedData[key][index] = hole
        }
      })
    } else {
      if (!mainData[key]) {
        formatedData[key] = caddieData[key]
      } else {
        formatedData[key] = mainData[key]
      }
    }
  })
  return formatedData
}

const mergeCaddieData = (mainData, caddieData) => {
  const mainHead = mainData.head
  const caddieHead = caddieData.head
  const formatedHead = mergeRowCaddieData(mainHead, caddieHead)

  const mainBody = mainData.body
  const caddieBody = caddieData.body
  const formatedBody = mainBody.map((playerData) => {
    const caddieData = caddieBody.find(caddieData => caddieData.name === playerData.name)
    const formatedPlayer = mergeRowCaddieData(playerData || {}, caddieData || {})
    return formatedPlayer
  })
  return { head: formatedHead, body: formatedBody }
}

const calculateScore = ({ head, body }) => {
  const sumCourtShotDayOne = head.dayOne.reduce((a,b) => +a + +b)
  const sumCourtShotDayTwo = head.dayTwo.reduce((a,b) => +a + +b)
  const sumCourtShotDayThree = head.dayThree.reduce((a,b) => +a + +b)
  const sumCourtShot = sumCourtShotDayOne + sumCourtShotDayTwo + sumCourtShotDayThree
  const calculatedCourtScore = {
    ...head,
    shotDayOne: sumCourtShotDayOne,
    shotDayTwo: sumCourtShotDayTwo,
    shotDayThree: sumCourtShotDayThree,
    shotSummary: sumCourtShot,

    parDayOne: 0,
    parDayTwo: 0,
    parDayThree: 0,
    parSummary: 0,
  }

  const calculatedPlayersScore = body.map((palyer) => {
    const sumPlayerShotDayOne = palyer.dayOne.reduce((a,b) => +a + +b)
    const parDayOne = palyer.dayOne.reduce((acc, cur, index) => {
      if (!+cur) {
        return acc
      }
      return +acc + +cur - +head.dayOne[index]
    }, 0)

    const sumPlayerShotDayTwo = palyer.dayTwo.reduce((a,b) => +a + +b)
    const parDayTwo = palyer.dayTwo.reduce((acc, cur, index) => {
      if (!+cur) {
        return acc
      }
      return +acc + +cur - +head.dayTwo[index]
    }, 0)

    const sumPlayerShotDayThree = palyer.dayThree.reduce((a,b) => +a + +b)
    const parDayThree = palyer.dayThree.reduce((acc, cur, index) => {
      if (!+cur) {
        return acc
      }
      return +acc + +cur - +head.dayThree[index]
    }, 0)

    const sumPlayerShot = sumPlayerShotDayOne + sumPlayerShotDayTwo + sumPlayerShotDayThree
    const sumPlayerPar = parDayOne + parDayTwo + parDayThree
    return {
      ...palyer,
      shotDayOne: sumPlayerShotDayOne,
      shotDayTwo: sumPlayerShotDayTwo,
      shotDayThree: sumPlayerShotDayThree,
      shotSummary: sumPlayerShot,

      parDayOne: parDayOne,
      parDayTwo: parDayTwo,
      parDayThree: parDayThree,
      parSummary: sumPlayerPar,
    }
  })
  
  return { court: calculatedCourtScore, players: calculatedPlayersScore  }
}

const calculateRanking = (players) => {
  const sortedPlayers = _.sortBy(_.filter(players), ['group', 'parSummary','releaseGroup', 'releaseGroupPosition'])
  const playerByGroup = _.groupBy(sortedPlayers, player => player.group)
  return _.flatten(
    Object.keys(playerByGroup).map(groupId => {
      let ranking = 0
      let sameRanking = 1
      return playerByGroup[groupId].map((player, userIndex, array) => {
        if (userIndex != 0 && player.parSummary === array[userIndex - 1].parSummary ) {
          sameRanking += 1
        } else {
          ranking += sameRanking
          sameRanking = 1
        }
        return {
          ...player,
          ranking
        }
      })
    })
  )
}

const insertEmptyData = (players, amount) => {
  let i = 0
  while (i < amount) {
    players.push(EMPTY_DATA)
    i++
  }
  return players
}

export {
  convertTextData,
  calculateScore,
  calculateRanking,
  insertEmptyData,
  mergeCaddieData,
  EMPTY_DATA
}
