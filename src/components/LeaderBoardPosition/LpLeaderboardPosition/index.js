import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import Panel from '../../Panel'

import cupImage from '../../../assets/banners/cup.png'
import cupImage_x2 from '../../../assets/banners/cup@x2.png'
import { TYPE } from '../../../Theme'
import { formattedNum, shortenStraknetAddress } from '../../../utils'
import { Flex } from 'rebass'
import { useMedia } from 'react-use'
import { Wrapper, Decoration, ClearSearchLink, PositionPanelHeader, PositionPanel, PositionDataWrapper, DataItem, DataItemTitle, DataItemValue, ErrorContainer, ErrorHeader, ErrorText } from '../styled.js'

function LpLeaderboardPosition({ position, searchError, onClearSearch }) {
  const below600 = useMedia('(max-width: 600px)')
  const handleClearSearchClick = (e) => {
    e.preventDefault()
    onClearSearch && onClearSearch()
  }

  return (
    <Wrapper>
      <PositionPanelHeader>
        <TYPE.main color={'#CCC'} fontSize={'18px'}>
          Search result for:
        </TYPE.main>
        <ClearSearchLink href={'#'} onClick={handleClearSearchClick}>
          Clear search
        </ClearSearchLink>
      </PositionPanelHeader>
      {position && (
        <PositionPanel>
          <PositionDataWrapper>
            <DataItem area={'address'}>
              <DataItemTitle>Address</DataItemTitle>
              <DataItemValue style={{ fontWeight: 700 }}>{shortenStraknetAddress(position.address, 4)}</DataItemValue>
            </DataItem>
            {/* <DataItem area={'rank'}>
            <DataItemTitle>Rank</DataItemTitle>
            <DataItemValue>{position.rank}</DataItemValue>
          </DataItem> */}
            <DataItem area={'score'}>
              <DataItemTitle>Points</DataItemTitle>
              <DataItemValue>{position.score}</DataItemValue>
            </DataItem>
            {/* {!below600 && (
            <>
              <DataItem area={'trades'}>
                <DataItemTitle>Trades</DataItemTitle>
                <DataItemValue>{position.tradesCount}</DataItemValue>
              </DataItem>
              <DataItem area={'volume'}>
                <DataItemTitle>Volume ($)</DataItemTitle>
                <DataItemValue>{formattedNum(position.volumeUSD, true)}</DataItemValue>
              </DataItem>
            </>
          )} */}
          </PositionDataWrapper>
          <Decoration src={cupImage} srcSet={cupImage + ' 1x,' + cupImage_x2 + ' 2x'} alt={''} draggable={false} />
        </PositionPanel>
      )}
      {searchError && (
        <ErrorContainer>
          <ErrorHeader>
            Oops! We couldn’t find your wallet address in the leaderboard
          </ErrorHeader>
          <ErrorText>
            Please clear the search result and check for a different wallet address
          </ErrorText>
        </ErrorContainer>
      )}
    </Wrapper>
  )
}

export default withRouter(LpLeaderboardPosition)
