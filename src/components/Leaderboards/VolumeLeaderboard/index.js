import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Box, Flex } from 'rebass'
import { useMedia } from 'react-use'

import { TYPE } from '../../../Theme'
import { formattedNum, shortenStraknetAddress } from '../../../utils'
import LocalLoader from '../../LocalLoader'
import { Wrapper, PageButtons, Arrow, TabsContainer, TabItem, ListWrapper, List, DashGrid, DataText } from '../styled.js'
import { getStarIconByPosition } from '../icon.jsx'


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
        {/* {!below600 && (
          <>
            <DataText area="trades" justifyContent={'flex-end'}>
              {item.tradesCount}
            </DataText>
            <DataText area="volume" justifyContent={'flex-end'}>
              {formattedNum(item.volumeUSD, true)}
            </DataText>
          </>
        )} */}
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
      {/* <TabsContainer>
        <TabItem isActive={activeTab === tabsLookup.allTime} onClick={() => setActiveTab(tabsLookup.allTime)}>
          All time
        </TabItem>
        <TabItem isActive={activeTab === tabsLookup.monthly} onClick={() => setActiveTab(tabsLookup.monthly)}>
          Monthly
        </TabItem>
      </TabsContainer> */}

      <ListWrapper>
        <DashGrid>
          <Flex justifyContent="flex-start"></Flex>
          <Flex justifyContent="flex-start"></Flex>
          <Flex justifyContent="flex-start">
            <TYPE.main color={'#959595'} fontWeight={700}>
              Address
            </TYPE.main>
          </Flex>

          {/* {!below600 && (
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
          )} */}

          <Flex justifyContent="flex-end">
            <TYPE.main color={'#959595'} fontWeight={700}>
              Points
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
