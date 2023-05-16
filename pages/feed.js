import React from 'react'
import _ from 'lodash'

import { Context, Container, FullBackground, Button } from '../components/baseComponents'
import styled from 'styled-components'
import firebase from '../libs/firebase'
import { convertTextData, calculateScore, calculateRanking, EMPTY_DATA, mergeCaddieData } from '../libs/formatTextData'

let rootRef = null

const TableWrapper = styled.div`
  height: 100vh;
`

const Table = styled.div`
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
`

const TableHead = styled.div`
  width: 100%;
  margin: auto;
`

const TableBody = styled.div`
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  margin: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`

const TableRow = styled.div`
  display: flex;
  background: ${props => props.bgColor || 'transparent'};
  height: ${props => props.feedRowHeight ? `${props.feedRowHeight}px` : 'auto'};
`

const TableItem = styled.div`
  /* padding: 6px 8px; */
  overflow: hidden;
  white-space: nowrap;
  height: fit-content;
  margin: auto;
  text-align: center;
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  background-color: ${props => props.bgColor || 'transparent'};
  color: ${props => props.color || 'black'};
`

const Rank = styled(TableItem)`
  width: 5vw;
  font-size: ${(props) => props.feedSize ? 1.7 + (props.feedSize / 10) : 1.7 }vw;
`

const Name = styled(TableItem)`
  width: 28vw;
  text-overflow: ellipsis;
  font-size: ${(props) => props.feedSize ? 1.7 + (props.feedSize / 10) : 1.7 }vw;
  text-align: left;
`

const Hole = styled(TableItem)`
  width: 1.9vw;
  white-space: pre-wrap;
  font-size: ${(props) => {
    const feedSize = props.feedSize / 10 || 0
    const valueSize = props.value > 9 ? -1 : 0
    return 1.9 + feedSize + valueSize
  }}vw;
`
const HoleHeader = styled(TableItem)`
  width: 1.9vw;
  white-space: pre-wrap;
  font-size: ${(props) => props.feedSize ? 0.9 + (props.feedSize / 10) : 0.9 }vw;
`
const Par = styled.span`
  font-size: ${(props) => props.feedSize ? 1.4 + (props.feedSize / 10) : 1.4 }vw;
`
const Score = styled(TableItem)`
  width: 4.5vw;
  white-space: pre-wrap;
  font-size: ${(props) => props.feedSize ? 1.9 + (props.feedSize / 10) : 1.9 }vw;
  text-align: right;
`
const ScoreHeader = styled(TableItem)`
  width: 4.5vw;
  white-space: pre-wrap;
  font-size: ${(props) => props.feedSize ? 0.7 + (props.feedSize / 10) : 0.7 }vw;
`
const Round = styled(TableItem)`
  width: 3.8vw;
  white-space: pre-wrap;
  font-size: ${(props) => {
    const feedSize = props.feedSize / 10 || 0
    const valueSize = props.value > 99 ? -0.5 : 0
    return 1.9 + feedSize + valueSize
  }}vw;
`

const rowColorConfig = {
  '"a"': ['#bbbbbb', '#b3b3b3'],
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
    if (typeof window !== 'object') {
      return null
    }
    this.state = {
      NEXT_PUBLIC_LEAGUE: window.NEXT_PUBLIC_LEAGUE,
      dayDisplay: 'dayThree',
      textDb: null,
      title: '',
      subTitle: '',
      selectedDay: '',
      defaultDay: '1',
      skipping: 0,
      feedSize: 0
    }

    rootRef = firebase.database().ref(`golfscore/${this.state.NEXT_PUBLIC_LEAGUE}`)

    rootRef.child('textDb').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ textDb: data })
    })
    rootRef.child('caddieData').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ caddieData: data })
    })
    rootRef.child('playerDataSet').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ playerDataSet: data })
    })
    rootRef.child('caddieDataSet').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ caddieDataSet: data })
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

    rootRef.child('feedDelay').on('value', (snapshot) => {
      const data = snapshot.val()
      clearInterval(this.autoReload)
      this.autoReload = setInterval(() => {
        this.loadNext()
      }, data)
      this.setState({ feedDelay: data })
    })

    rootRef.child('feedPerPage').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ feedPerPage: parseInt(data) })
    })

    rootRef.child('feedSize').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ feedSize: parseInt(data) })
    })

    rootRef.child('feedRowHeight').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ feedRowHeight: parseInt(data) })
    })

  }

  componentWillUnmount() {
    clearInterval(this.autoReload)
  }

  loadNext() {
    if (!this.state.textDb || !this.state.caddieData || !this.state.playerDataSet || !this.state.caddieDataSet) {
      return (null)
    }
    const mergedData = mergeCaddieData(this.state.playerDataSet, this.state.caddieDataSet)

    const { court: head, players: body } = calculateScore(mergedData)
    const filterdPlayingPlayers = _.filter(body, player => +player.shotSummary)
    const calculatedRankingPlayers = calculateRanking(filterdPlayingPlayers)

    if (this.state.skipping + this.state.feedPerPage >= calculatedRankingPlayers.length - 1) {
      this.setState({ skipping: 0 })
    } else {
      this.setState({ skipping: this.state.skipping + this.state.feedPerPage })
    }
  }

  selectDay(day) {
    this.setState({ selectedDay: day })
  }

  render() {
    if (typeof window !== 'object') {
      return null
    }
    if (!this.state.textDb || !this.state.caddieData || !this.state.playerDataSet || !this.state.caddieDataSet) {
      return (null)
    }

    const mergedData = mergeCaddieData(this.state.playerDataSet, this.state.caddieDataSet)

    const { court: head, players: body } = calculateScore(mergedData)
    const filterdPlayingPlayers = _.filter(body, player => +player.shotSummary)
    const calculatedRankingPlayers = calculateRanking(filterdPlayingPlayers)

    let skippingFeedPlayers = calculatedRankingPlayers.slice(this.state.skipping, this.state.skipping + this.state.feedPerPage)
    while(skippingFeedPlayers.length < this.state.feedPerPage) {
      skippingFeedPlayers.push(EMPTY_DATA)
    }

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
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow bgColor="linear-gradient(#76af70, white)">
                    <Rank feedSize={this.state.feedSize}>
                      No.
                    </Rank>
                    <Name feedSize={this.state.feedSize}>
                      Name<span style={{ color: '#e92121', paddingLeft: '2vw'}}>{`(Round ${this.state.defaultDay})`}</span>
                    </Name>
                    {
                      head[dayDisplay].map((par, index) => {
                        if (index === 9) {
                          return (
                            <HoleHeader feedSize={this.state.feedSize} width={tableConfig[3+index]} style={{ paddingLeft: '2.2vw'}}>
                              {index + 1  }<br/><Par>({par})</Par>
                            </HoleHeader>
                          )
                        }
                        return (
                          <HoleHeader feedSize={this.state.feedSize} width={tableConfig[3+index]}>
                            {index + 1  }<br/><Par>({par})</Par>
                          </HoleHeader>
                        )
                      })
                    }
                    <ScoreHeader feedSize={this.state.feedSize}>
                      Score
                      <br />
                      {
                        head[dayDisplay].reduce((acc,cur) => +acc + +cur, 0)
                      }
                    </ScoreHeader>
                    <Round feedSize={this.state.feedSize}>
                      R1
                    </Round>
                    <Round feedSize={this.state.feedSize}>
                      R2
                    </Round>
                    <Round feedSize={this.state.feedSize}>
                      R3
                    </Round>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    skippingFeedPlayers.map((userData, userIndex) => {
                      let ranking = userData.ranking
                      if (userIndex != 0 && userData.parSummary === skippingFeedPlayers[userIndex - 1].parSummary ) {
                        ranking = ''
                      }

                      return (
                        <TableRow {...this.state} bgColor={getRowColor(userData, userIndex)}>
                          <Rank feedSize={this.state.feedSize}>
                            {ranking}
                          </Rank>
                          <Name feedSize={this.state.feedSize} align="left">
                            {userData.name}
                            {
                              userData.countryFlag && <span style={{ marginLeft: 8 }}>{userData.countryFlag}</span>
                            }
                          </Name>
                          {
                            userData[dayDisplay].map((hole, index) => {
                              const style = {}
                              if (index === 9)
                              style.paddingLeft = '2.2vw'
                              if (+hole == 0 || !+hole) {
                                return (
                                  <Hole value={+hole} feedSize={this.state.feedSize} color="red" style={style}>
                                    {''}
                                  </Hole>
                                )
                              }
                              if (+hole == +head[dayDisplay][index]) {
                                return (
                                  <Hole value={+hole} feedSize={this.state.feedSize} color="white" style={style}>
                                    {+hole}
                                  </Hole>
                                )
                              }
                              if (parseInt(+hole) < parseInt(+head[dayDisplay][index] - 1) && +hole) {
                                return (
                                  <Hole value={+hole} feedSize={this.state.feedSize} color="#e6e66d" style={Object.assign(style, {fontWeight: 'bold',textShadow: '0px 0px 8px #636363'})}>
                                    {+hole}
                                  </Hole>
                                )
                              }
                              if (parseInt(+hole) < parseInt(+head[dayDisplay][index])) {
                                return (
                                  <Hole value={+hole} feedSize={this.state.feedSize} color="red" style={style}>
                                    {+hole}
                                  </Hole>
                                )
                              }
                              return (
                                <Hole value={+hole} feedSize={this.state.feedSize} style={style}>
                                  {+hole}
                                </Hole>
                              )
                            })
                          }
                          <Score feedSize={this.state.feedSize} color={userData.parSummary < 0 ? 'red' : userData.parSummary > 0 ? 'blue' : null}>
                            {
                              userData.parSummary == 0 ? 'E' : userData.parSummary > 0 ? `+${userData.parSummary}` : userData.parSummary
                            }
                          </Score>
                          <Round value={userData.shotDayOne} feedSize={this.state.feedSize} color={userData.shotDayOne - head.shotDayOne < 0 ? 'red' : userData.shotDayOne - head.shotDayOne > 0 ? 'blue' : null} width={tableConfig[21]}>
                            <span style={{color: "black"}}>
                              {userData.shotDayOne}
                            </span>
                          </Round>
                          <Round value={userData.shotDayTwo} feedSize={this.state.feedSize} color={userData.shotDayTwo - head.shotDayTwo < 0 ? 'red' : userData.shotDayTwo - head.shotDayTwo > 0 ? 'blue' : null} width={tableConfig[21]}>
                            <span style={{color: "black"}}>
                              {userData.shotDayTwo}
                            </span>
                          </Round>
                          <Round value={userData.shotDayThree} feedSize={this.state.feedSize} color={userData.shotDayThree - head.shotDayThree < 0 ? 'red' : userData.shotDayThree - head.shotDayThree > 0 ? 'blue' : null} width={tableConfig[21]}>
                            <span style={{color: "black"}}>
                              {userData.shotDayThree}
                            </span>
                          </Round>
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
