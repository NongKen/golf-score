import React from 'react'

import { Context, Container, FullBackground, Image } from '../components/baseComponents'
import styled from 'styled-components'
import firebase from '../libs/firebase'
import { convertTextData, insertEmptyData } from '../libs/formatTextData'
import _ from 'lodash'

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

const getSumShot = (data) => {
  let sum = 0
  data.forEach(shot => sum += +shot)
  return sum
}

const checkDiffUserCourt = (userRaw, courtRaw) => {
  let userDataWithIndex = userRaw.map((data, index) => {return {data, index}})
  userDataWithIndex = userDataWithIndex.filter(data => data.data)
  const userData = userDataWithIndex.map(data => data.data)
  const userIndex = userDataWithIndex.map(data => data.index)
  const courtWithUserlength = courtRaw.filter((data, index) => {
    if (userIndex.includes(index)) {
      return true
    }
    return false
  })
  const sumCourt = getSumShot(courtWithUserlength)
  const sumShot = getSumShot(userData)
  return {
    sumCourt,
    sumShot
  }
}

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

const getDayDisplay = ({ selectedDay, defaultDay }) => {
  let dayDisplay = 'dayOne'
  if (selectedDay) {
    if (selectedDay == 2) dayDisplay = 'dayTwo'
    if (selectedDay == 3) dayDisplay = 'dayThree'
  } else {
    if (defaultDay === '2') dayDisplay = 'dayTwo'
    if (defaultDay === '3') dayDisplay = 'dayThree'
  }
  return dayDisplay
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
      defaultDay: '1',

      caddiePassword: '',
      caddiePasswordInput: '',
      caddiePasswordSubmitted: '',

      showModal: false,
      editedHole: '',
      editedUser: {},

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
    rootRef.child('caddiePassword').on('value', (snapshot) => {
      const data = snapshot.val()
      this.setState({ caddiePassword: data })
    })

  }

  selectDay(day) {
    this.setState({ selectedDay: day })
  }

  render() {
    if (this.state.caddiePassword != this.state.caddiePasswordSubmitted) {
      return (
        <FullBackground color="#cecece">
          <Context>
            <Container>
              <div style={{ textAlign: "center" }}>
                <div style={{ marginTop: 8 }}>
                  กรุณาใส่รหัสผ่าน
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  this.setState({ caddiePasswordSubmitted: this.state.caddiePasswordInput, caddiePasswordInput: "" })
                }}>
                  {
                    this.state.caddiePasswordSubmitted != "" && (
                      <div style={{ marginTop: 8, color: "red" }}>
                        รหัสผ่านไม่ถูกต้อง
                      </div>
                    )
                  }
                  <div style={{ marginTop: 8 }}>
                    <input name="password" autoFocus onChange={(e) => this.setState({ caddiePasswordInput: e.target.value })} value={this.state.caddiePasswordInput}/>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <input type="submit" name="submit" value="ยืนยัน" />
                  </div>
                </form>
              </div>
            </Container>
          </Context>
        </FullBackground>
      )
    }
    if (!this.state.textDb) {
      return (null)
    }
    const { head, body } = convertTextData(this.state.textDb)

    let sortedBody = _.sortBy(_.sortBy(body, ['releaseGroup', 'releaseGroupPosition']), (o) => {
      if (!o.releaseGroup) {
        return 1
      }
      if (o.releaseGroup % 2 === 0) {
        return 0
      }
      return -1
    })

    sortedBody = insertEmptyData(sortedBody, 20) 

    const dayDisplay = getDayDisplay({
      selectedDay: this.state.selectedDay,
      defaultDay: this.state.defaultDay
    })
    return (
      <FullBackground color="#cecece">
        <Context style={{ overflow: 'hidden' }}>
          <Container>
            <div style={{ backgroundColor: '#f3ffe6', textAlign: 'center' }}>
              <div>
                <Image src="/static/logo/logo.png" height="80px" />
              </div>
              <div style={{paddingLeft: '12px', fontSize: '24px'}}>
                {this.state.title}
              </div>
              <div style={{paddingLeft: '12px', fontSize: '16px'}}>
                {this.state.subTitle}
              </div>
              <div style={{paddingLeft: '12px', fontSize: '16px'}}>
                {`day ${this.state.defaultDay}`}
              </div>
            </div>
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
                    {
                      head[dayDisplay].map((par, index) => {
                        let prefix = 0
                        if (dayDisplay === 'dayTwo') prefix = 1
                        if (dayDisplay === 'dayThree') prefix = 2
                        if(index >= this.props.url.query.group || index < this.props.url.query.group - 3) {
                          return null
                        }
                        return (
                          <TableItem width={tableConfig[3+index]}>
                            {index + 1  } ({par})
                          </TableItem>
                        )
                      })
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    sortedBody.map((userData, userIndex) => {
                      const shotData = checkDiffUserCourt(userData[dayDisplay], head[dayDisplay])
                      const sumUser = userData[dayDisplay].reduce((a,b) => +a + + b)
                      let { releaseNumber } = userData
                      if(!this.props.url.query.group) {
                        return null
                      }
                      return (
                        <TableRow bgColor={getRowColor(userData, userIndex)}>
                          <TableItem width={tableConfig[0]}>
                            {releaseNumber}
                          </TableItem>
                          <TableItem align="left" width={tableConfig[1]}>
                            {userData.name}
                          </TableItem>
                          {
                            userData[dayDisplay].map((hole, index) => {
                              if(index >= this.props.url.query.group || index < this.props.url.query.group - 3) {
                                return null
                              }
                              if (+hole === 0 || !hole) {
                                return (
                                  <TableItem width={tableConfig[3 + index]} onClick={() => this.setState({ showModal: true, editedHole: index, editedUser: userData })}>
                                    {''}
                                  </TableItem>
                                )
                              }
                              if (hole == head[dayDisplay][index]) {
                                return (
                                  <TableItem color="white" width={tableConfig[3 + index]} onClick={() => this.setState({ showModal: true, editedHole: index, editedUser: userData })}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              if (parseInt(hole) < parseInt(head[dayDisplay][index] - 1) && hole) {
                                return (
                                  <TableItem color="red" bgColor="#e6e66d" width={tableConfig[3 + index]} onClick={() => this.setState({ showModal: true, editedHole: index, editedUser: userData })}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              if (parseInt(hole) < parseInt(head[dayDisplay][index])) {
                                return (
                                  <TableItem color="red" width={tableConfig[3 + index]} onClick={() => this.setState({ showModal: true, editedHole: index, editedUser: userData })}>
                                    {hole}
                                  </TableItem>
                                )
                              }
                              return (
                                <TableItem width={tableConfig[3 + index]} onClick={() => this.setState({ showModal: true, editedHole: index, editedUser: userData })}>
                                    {hole}
                                </TableItem>
                              )
                            })
                          }
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </TableWrapper>
          </Container>
        </Context>
        {
          this.state.showModal && (
            <div
              style={{
                position: 'absolute',
                background: '#00000040',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <div
                style={{
                  margin: 'auto',
                  marginTop: '30%',
                  width: 'fit-content',
                  padding: '16px',
                  background: 'white',
                  border: '1px solid',
                  borderRadius: '3px',
                }}
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const textDb = this.state.textDb
                  const row = textDb.split('""')
                  const data = row.map((rowData) => {
                    if (rowData.includes(`"${this.state.editedUser.name}"`)) {
                      const splitData = rowData.split('	')
                      let offsetIndex = 999
                      if (dayDisplay === 'dayOne') {
                        offsetIndex = 3
                      } else if (dayDisplay === 'dayTwo') {
                        offsetIndex = 3 + 18
                      } else if (dayDisplay === 'dayThree') {
                        offsetIndex = 3 + 18 + 18
                      }
                      splitData[offsetIndex + this.state.editedHole + 1] = this.state.editedScore
                      const updatedData = splitData.join('	')
                      return updatedData
                    }
                    return rowData
                  })
                  const updatedData = data.join('""')
                  rootRef.child('/textDb/').set(updatedData)
                  rootRef.child('/feed/').set(updatedData)

                  this.setState({
                    showModal: false,
                    editedHole: '',
                    editedUser: {},
                    editedScore: '',
                    textDb: updatedData
                  })
                }}>
                  <div>{`แก้ไขคะแนน  วันที่ ${this.state.defaultDay}`}</div>
                  <div>ชื่อ: {this.state.editedUser.name}</div>
                  <div>หลุม: {this.state.editedHole + 1}</div>
                  <div>จากคะแนน: {this.state.editedUser[dayDisplay][this.state.editedHole]}</div>
                  <div>เป็นคะแนน: <input type="number" defaultValue={this.state.editedUser[dayDisplay][this.state.editedHole]} autoFocus onChange={(e) => this.setState({ editedScore: e.target.value })}/></div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-around' }}>
                    <input type="submit" name="submit" value="ยืนยัน" />
                    <button
                      style={{ background: '#ffa7a7' }}
                      onClick={() => this.setState({ showModal: false, editedHole: '', editedUser: {}, editedScore: '' })}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </FullBackground>
    )
  }
}
export default Home
