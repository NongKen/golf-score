import Link from 'next/link'
import styled from 'styled-components'
import { Base, Container, Image, Button } from './baseComponents'

const NavbarContext = styled.div`
  width: 100%;  
`

const NavbarContainer = styled.div`
  max-width: 1196px;
  background-color: #f3ffe6;
  margin: auto;
`

const FlexWrapper = styled.div`
  display: flex;
  flex-direction: ${(props) => props.direction ? props.direction : 'row'};
`

const TabContainer = styled.div`
  display: flex;
  list-style: none;
  padding-left: 12px;
`

const TabItem = styled.div`
  float: left;
`

const Navbar = (props) => {
  const tabList = [
    {
      text: 'Day 1',
      color: 'white',
      link: '1'
    },
    {
      text: 'Day 2',
      color: 'white',
      link: '2'
    },
    {
      text: 'Day 3',
      color: 'white',
      link: '3'
    }
  ]
  if (props.selectedDay) {
    tabList[+props.selectedDay - 1].color = '#d2d2d2'
  } else if (props.defaultDay) {
    tabList[+props.defaultDay - 1].color = '#d2d2d2'    
  } else {
    tabList[0].color = '#d2d2d2'    
  }
  return (
    <NavbarContext>
      <NavbarContainer>
        <FlexWrapper>
          <div>
            <Image src={`/static/logo/${props.NEXT_PUBLIC_LEAGUE}.png`} height="80px" />
          </div>
          <FlexWrapper direction="column">
            <div style={{paddingLeft: '12px', fontSize: '24px'}}>
              {props.title}
            </div>
            <div style={{paddingLeft: '12px', fontSize: '16px'}}>
              {props.subTitle}
            </div>
            <TabContainer>
              {
                tabList.map((item, index) => (
                  <TabItem>
                    <Button color={item.color} onClick={() => props.selectDay(index + 1)}>
                      {item.text}
                    </Button>
                  </TabItem>
                ))
              }
            </TabContainer>
          </FlexWrapper>
        </FlexWrapper>
      </NavbarContainer>
    </NavbarContext>
  )
}

export default Navbar
