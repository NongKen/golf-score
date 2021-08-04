import React from 'react'
import Link from 'next/link'

import { Context, Container, FullBackground } from '../../components/baseComponents'
import Navbar from '../../components/Navbar'
import styled from 'styled-components'
import firebase from '../../libs/firebase'
import config from '../../config'

const rootRef = firebase.database().ref('golfscore')

const Modle = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000cc;
  :after {
    content: "";
    display: table;
    clear: both;
  }
`

const ModleCard = styled.div`
  background: white;
  max-width: 400px;
  min-height: 400px;
  margin: auto;
  margin-top: 20px;
  border-radius: 16px;
  padding: 24px;

  pointer-events: none;

  :before {
    content: "";
    display: table;
    clear: both;
  }
`

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

const HoleInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
`

const getSumShot = (data) => {
  let sum = 0
  data.forEach(shot => sum += +shot)
  return sum
}

const checkDiffUserCourt = (userRaw, courtRaw) => {
  const userData = userRaw.filter(data => data)
  const userLength = userData.length
  const courtWithUserlength = courtRaw.slice(0, userLength)
  const sumCourt = getSumShot(courtWithUserlength)
  const sumShot = getSumShot(userData)
  return {
    sumCourt,
    sumShot
  }
}

const tableConfig = ['25px', '25px', '200px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '25px', '75px']
  

class Home extends React.Component {  
  constructor(props) {
    super(props)
    this.state = {
      formData: null,
      showModle: false,
      modleRow: null,
      modleHole: null
    }
    rootRef.child('formData').on('value', (snapshot) => {
      const data = snapshot.val()
      const updatedTime = Date.now()
      this.setState({ formData: data, updatedTime })
    })
  }

  onChangeUser(rowIndex, itemIndex, value) {
    let formData = this.state.formData
    formData[rowIndex][itemIndex] = value

    rootRef.child('/formData/').set(formData)
  }

  onChangeHoleData(rowIndex, holeIndex, value) {
    let formData = this.state.formData
    formData[rowIndex][3][holeIndex] = value

    rootRef.child('/formData/').set(formData)
  }

  render() {
    if (!this.state.formData) {
      return (null)
    }
   
    return (
      <FullBackground color="#cecece">
        <Context>
          <Container> 
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableItem width={tableConfig[0]}>Group</TableItem>
                    <TableItem width={tableConfig[1]}>Ball</TableItem>
                    <TableItem width={tableConfig[2]}>Name</TableItem>
                    <TableItem width={tableConfig[3]}>1</TableItem>
                    <TableItem width={tableConfig[4]}>2</TableItem>
                    <TableItem width={tableConfig[5]}>3</TableItem>
                    <TableItem width={tableConfig[6]}>4</TableItem>
                    <TableItem width={tableConfig[7]}>5</TableItem>
                    <TableItem width={tableConfig[8]}>6</TableItem>
                    <TableItem width={tableConfig[9]}>7</TableItem>
                    <TableItem width={tableConfig[10]}>8</TableItem>
                    <TableItem width={tableConfig[11]}>9</TableItem>
                    <TableItem width={tableConfig[12]}>10</TableItem>
                    <TableItem width={tableConfig[13]}>11</TableItem>
                    <TableItem width={tableConfig[14]}>12</TableItem>
                    <TableItem width={tableConfig[15]}>13</TableItem>
                    <TableItem width={tableConfig[16]}>14</TableItem>
                    <TableItem width={tableConfig[17]}>15</TableItem>
                    <TableItem width={tableConfig[18]}>16</TableItem>
                    <TableItem width={tableConfig[19]}>17</TableItem>
                    <TableItem width={tableConfig[20]}>18</TableItem>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    this.state.formData.map((rowData, rowIndex) => {
                      return (
                        <TableRow>
                          <TableItem width={tableConfig[0]}>
                            <HoleInput type="text" value={rowData[0]} onChange={(e) => this.onChangeName(rowIndex, 0, e.target.value)}/>
                          </TableItem>
                          <TableItem width={tableConfig[1]}>
                            <HoleInput type="text" value={rowData[1]} onChange={(e) => this.onChangeName(rowIndex, 1, e.target.value)}/>
                          </TableItem>
                          <TableItem width={tableConfig[2]}>
                            <HoleInput type="text" value={rowData[2]} onChange={(e) => this.onChangeName(rowIndex, 2, e.target.value)}/>
                          </TableItem>
                          {
                            rowData[3].map((hole, holeIndex) => (
                              <TableItem
                                width={tableConfig[3+holeIndex]}
                                style={{ cursor: 'pointer', borderLeft: `1px solid ${holeIndex === 9 ? 'white' : 'black '}`, borderRight: `1px solid ${holeIndex === 8 ? 'white' : 'black '}`}}
                              >
                                <HoleInput type="number" value={hole === 'empty' ? null : hole} onChange={(e) => this.onChangeHoleData(rowIndex , holeIndex, e.target.value)}/>
                              </TableItem>
                            ))
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
      </FullBackground>
    )
  }
}

export default Home