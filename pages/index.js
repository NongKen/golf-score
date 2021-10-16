import React from 'react'
import _ from 'lodash'

import { Context, Container, FullBackground } from '../components/baseComponents'
import Navbar from '../components/Navbar'
import styled from 'styled-components'
import firebase from '../libs/firebase'
import { convertTextData, calculateScore, calculateRanking, insertEmptyData } from '../libs/formatTextData'

const rootRef = firebase.database().ref('golfscore/tctlivegolfscore')

const TableWrapper = styled.div`
  height: 100vh;
`

const Table = styled.div`
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
`

const TableHead = styled.div`
  width: fit-content;
  margin: auto;
`

const TableBody = styled.div`
  overflow-y: scroll;
  height: 91vh;
  width: fit-content;
  margin: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`

const TableRow = styled.div`
  display: flex;
  background: ${props => props.bgColor || 'transparent'};
`

const TableItem = styled.div`
  padding: 6px 8px;
  border: 1px solid black;
  overflow: hidden;
  width: ${props => props.width || 'auto'};
  text-align: ${props => props.align || 'center'};
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  background-color: ${props => props.bgColor || 'transparent'};
  color: ${props => props.color || 'black'};
`

const rowColorConfig = {
  '"a"': ['#bbbbbb', '#989898'],
  '"b"': ['#d6adad', '#e494a9'],
  '"c"': ['#5b8c74', '#9abf9a'],
}

const getRowColor = (userData, userIndex) => {
  const keys = Object.keys(rowColorConfig)
  if (keys.includes(userData.group)) {
    return rowColorConfig[userData.group][userIndex % 2]
  }
  return rowColorConfig['"a"'][userIndex % 2]
}

const tableConfig = ['25px', '200px', '50px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '75px']


class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dayDisplay: 'dayThree',
      textDb: null,
      title: '',
      subTitle: '',
      selectedDay: '',
      defaultDay: '1'
    }
    rootRef.child('textDb').on('value', (snapshot) => {
      const data = snapshot.val()
      const updatedTime = Date.now()
      this.setState({ textDb: data, updatedTime })
    })
    rootRef.child('title').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ title: data })
    })
    rootRef.child('subTitle').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ subTitle: data })
    })
    rootRef.child('defaultDay').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ defaultDay: data })
    })

  }

  selectDay(day) {
    this.setState({ selectedDay: day })
  }

  render() {
    if (!this.state.textDb) {
      return (null)
    }
    const { court: head, players: body } = calculateScore(convertTextData(this.state.textDb))
    const filterdPlayingPlayers = _.filter(body, player => player.shotSummary)

    const players = insertEmptyData(calculateRanking(filterdPlayingPlayers), 10)

    let dayDisplay = 'dayOne'
    if (this.state.selectedDay) {
      if (this.state.selectedDay == 2) dayDisplay = 'dayTwo'
      if (this.state.selectedDay == 3) dayDisplay = 'dayThree'
    } else {
      if (this.state.defaultDay === '2') dayDisplay = 'dayTwo'
      if (this.state.defaultDay === '3') dayDisplay = 'dayThree'
    }
    return (
      <FullBackground color="#cecece">
        <Context>
          <Container>
            <Navbar {...this.props} {...this.state} selectDay={(day) => this.selectDay(day)}/>
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow bgColor="linear-gradient(#76af70, white)">
                    <TableItem width={tableConfig[0]}>
                      Pos.
                    </TableItem>
                    <TableItem align="center" width={tableConfig[1]}>
                      Name
                    </TableItem>
                    <TableItem width={tableConfig[2]}>
                      Score
                    </TableItem>
                    {
                      head[dayDisplay].map((par, index) => {
                        return (
                          <TableItem width={tableConfig[3+index]}>
                            {index + 1  } ({par})
                          </TableItem>
                        )
                      })
                    }
                    <TableItem width={tableConfig[21]}>
                      {
                        dayDisplay === 'dayOne' ? 'Day 1' : (
                        dayDisplay === 'dayTwo' ? 'Day 2' : 'Day 3'
                        )
                      }
                      <br />({head[`shot${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`]})
                    </TableItem>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    players.map((userData, userIndex) => {
                      let ranking = userData.ranking
                      if (userIndex != 0 && userData.parSummary === players[userIndex - 1].parSummary ) {
                        ranking = ''
                      }
                      return (
                        <TableRow bgColor={getRowColor(userData, userIndex)}>
                          <TableItem width={tableConfig[0]}>
                            {ranking}
                          </TableItem>
                          <TableItem align="left" width={tableConfig[1]}>
                            {userData.name}
                          </TableItem>
                          <TableItem color={userData.parSummary < 0 ? 'red' : userData.parSummary > 0 ? 'blue' : null} width={tableConfig[2]}>
                            {
                              userData.parSummary == 0 ? 'E' : userData.parSummary > 0 ? `+${userData.parSummary}` : userData.parSummary
                            }
                          </TableItem>
                          {
                            userData[dayDisplay].map((hole, index) => {
                              if (hole == 0) {
                                return (
                                  <TableItem color="red" width={tableConfig[3 + index]} style={{ borderLeft: `1px solid ${index === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${index === 8 ? 'white' : 'black '}`}}>
                                    {''}
                                  </TableItem>
                                )
                              }
                              if (hole == head[dayDisplay][index]) {
                                return (
                                  <TableItem color="white " width={tableConfig[3 + index]} style={{ borderLeft: `1px solid ${index === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${index === 8 ? 'white' : 'black '}`}}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              if (parseInt(hole) < parseInt(head[dayDisplay][index] - 1) && hole) {
                                return (
                                  <TableItem color="red" bgColor="#e6e66d" width={tableConfig[3 + index]} style={{ borderLeft: `1px solid ${index === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${index === 8 ? 'white' : 'black '}`}}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              if (parseInt(hole) < parseInt(head[dayDisplay][index])) {
                                return (
                                  <TableItem color="red" width={tableConfig[3 + index]} style={{ borderLeft: `1px solid ${index === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${index === 8 ? 'white' : 'black '}`}}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              return (
                                  <TableItem width={tableConfig[3 + index]} style={{ borderLeft: `1px solid ${index === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${index === 8 ? 'white' : 'black '}`}}>
                                    {hole}
                                </TableItem>
                              )
                            })
                          }
                          <TableItem
                            color={
                              userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`] < 0
                                ? 'red'
                                : userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`] > 0
                                  ? 'blue'
                                  : null
                            }
                            width={tableConfig[21]}
                          >
                            {
                              userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`] == 0
                                ? 'E'
                                : userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`] > 0
                                  ? `+${userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`]}`
                                  : userData[`par${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`]
                            }
                            <span style={{color: "black"}}>
                              {` (${userData[`shot${dayDisplay[0].toUpperCase()}${dayDisplay.slice(1)}`]})`}
                            </span>
                          </TableItem>
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableWrapper>
          </Container>
        </Context>
      </FullBackground>
    )
  }
}

export default Home
