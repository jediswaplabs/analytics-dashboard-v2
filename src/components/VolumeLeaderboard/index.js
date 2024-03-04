import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Box, Flex } from 'rebass'
import { Star } from 'react-feather'
import { useMedia } from 'react-use'

import { TYPE } from '../../Theme'
import { formattedNum, shortenStraknetAddress } from '../../utils'
import LocalLoader from '../LocalLoader'

const Wrapper = styled.div`
  display: grid;
  gap: 30px;

  @media screen and (max-width: 1080px) {
    gap: 16px;
  }
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme, faded }) => (faded ? theme.jediGrey : theme.paginationTest)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;
  :hover {
    cursor: pointer;
  }
`

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`
const TabItem = styled.button`
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  border: none;
  color: #50d5ff;
  background: none;
  cursor: pointer;
  min-width: 140px;
  padding: 0 12px;
  height: 32px;
  ${(props) =>
    props.isActive &&
    css`
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    `}
`

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 20px 20px 6fr 0.6fr 1fr 0.6fr;
  grid-template-areas: 'number star address trades volume score';
  padding: 14px 20px 14px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);

  @media screen and (max-width: 1200px) {
    grid-template-columns: 20px 20px 4fr 0.6fr 1fr 0.6fr;
  }

  @media screen and (max-width: 600px) {
    grid-template-columns: 20px 20px 6fr 1fr;
    grid-template-areas: 'number star address score';
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;

  font-size: 13px;
  font-weight: 500;

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const tabsLookup = {
  allTime: 'allTime',
  monthly: 'monthly',
}
function VolumeLeaderboard({ leaderboardPositions, itemMax = 10 }) {
  const [activeTab, setActiveTab] = useState(tabsLookup.allTime)

  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const formattedLeaderboardPositions = useMemo(() => {
    return leaderboardPositions //TODO add normalization if necessary
  }, [leaderboardPositions])

  const filteredLeaderboardPositionAddresses = useMemo(() => {
    return Object.keys(leaderboardPositions)
  }, [leaderboardPositions])

  const below1200 = useMedia('(max-width: 1200px)')
  const below600 = useMedia('(max-width: 600px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [leaderboardPositions])

  useEffect(() => {
    if (filteredLeaderboardPositionAddresses) {
      let extraPages = 1
      if (filteredLeaderboardPositionAddresses.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(filteredLeaderboardPositionAddresses.length / itemMax) + extraPages)
    }
  }, [leaderboardPositions, filteredLeaderboardPositionAddresses, itemMax])

  const filteredLeaderboardPositions = useMemo(() => {
    //TODO filter data based on activeTab value
    return (
      filteredLeaderboardPositionAddresses &&
      filteredLeaderboardPositionAddresses.slice(itemMax * (page - 1), page * itemMax).map((address) => formattedLeaderboardPositions[address])
    )
  }, [formattedLeaderboardPositions, page, itemMax, activeTab])

  const getStarIconByPosition = (position) => {
    switch (position) {
      case 1: {
        return <Star fill={'#F7E886'} color={'transparent'} />
      }
      case 2: {
        return <Star fill={'#c9c9c9'} color={'transparent'} />
      }
      case 3: {
        return <Star fill={'#FFDAB4'} color={'transparent'} />
      }
      default: {
        return null
      }
    }
  }
  const ListItem = ({ item, index }) => {
    if (!item) {
      return null
    }

    return (
      <DashGrid focus={true}>
        <DataText area="number" justifyContent={'center'}>
          {index}
        </DataText>
        <DataText area="star" justifyContent={'center'}>
          {getStarIconByPosition(index)}
        </DataText>
        <DataText area="address" justifyContent={'flex-start'}>
          {below600 ? shortenStraknetAddress(item.address, 8) : below1200 ? shortenStraknetAddress(item.address, 16) : item.address}
        </DataText>
        {!below600 && (
          <>
            <DataText area="trades" justifyContent={'flex-end'}>
              {item.tradesCount}
            </DataText>
            <DataText area="volume" justifyContent={'flex-end'}>
              {formattedNum(item.volumeUSD, true)}
            </DataText>
          </>
        )}
        <DataText area="score" justifyContent={'flex-end'}>
          {item.score}
        </DataText>
      </DashGrid>
    )
  }

  if (!filteredLeaderboardPositions) {
    return <LocalLoader />
  }

  return (
    <Wrapper>
      <TabsContainer>
        <TabItem isActive={activeTab === tabsLookup.allTime} onClick={() => setActiveTab(tabsLookup.allTime)}>
          All time
        </TabItem>
        <TabItem isActive={activeTab === tabsLookup.monthly} onClick={() => setActiveTab(tabsLookup.monthly)}>
          Monthly
        </TabItem>
      </TabsContainer>

      <ListWrapper>
        <DashGrid>
          <Flex justifyContent="flex-start"></Flex>
          <Flex justifyContent="flex-start"></Flex>
          <Flex justifyContent="flex-start">
            <TYPE.main color={'#959595'} fontWeight={700}>
              Address
            </TYPE.main>
          </Flex>

          {!below600 && (
            <>
              <Flex justifyContent="flex-end">
                <TYPE.main color={'#959595'} fontWeight={700}>
                  Trades
                </TYPE.main>
              </Flex>
              <Flex justifyContent="flex-end">
                <TYPE.main color={'#959595'} fontWeight={700}>
                  Volume ($)
                </TYPE.main>
              </Flex>
            </>
          )}

          <Flex justifyContent="flex-end">
            <TYPE.main color={'#959595'} fontWeight={700}>
              Score
            </TYPE.main>
          </Flex>
        </DashGrid>

        <List p={0}>
          {filteredLeaderboardPositions.map((position, index) => {
            return (
              <div key={index}>
                <ListItem key={index} index={(page - 1) * itemMax + index + 1} item={position} />
              </div>
            )
          })}
        </List>
        {maxPage > 1 && (
          <PageButtons>
            <div
              onClick={(e) => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow faded={page === 1 ? true : false}>{'<'}</Arrow>
            </div>
            <TYPE.body style={{ display: 'flex', alignItems: 'center' }}>{page + ' of ' + maxPage}</TYPE.body>
            <div
              onClick={(e) => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow faded={page === maxPage ? true : false}>{'>'}</Arrow>
            </div>
          </PageButtons>
        )}
      </ListWrapper>
    </Wrapper>
  )
}

export default withRouter(VolumeLeaderboard)
