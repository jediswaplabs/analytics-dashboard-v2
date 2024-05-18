import React, { useState, useEffect, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import Panel from '../Panel'
import digitalWalletImage from '../../assets/banners/digital_wallet.png'
import digitalWalletImage_x2 from '../../assets/banners/digital_wallet@x2.png'

import cupImage from '../../assets/banners/cup.png'
import cupImage_x2 from '../../assets/banners/cup@x2.png'
import { TYPE } from '../../Theme'
import { formattedNum, shortenStraknetAddress } from '../../utils'
import { Flex } from 'rebass'
import { useMedia } from 'react-use'

const Wrapper = styled.div`
  display: grid;
  gap: 16px;
`

const Decoration = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  max-width: 100%;
  width: 111px;
  z-index: 0;
  user-select: none;
`

const ClearSearchLink = styled.a`
  color: #50d5ff;
  font-size: '12px';
`

const PositionPanelHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`

const PositionPanel = styled(Panel)`
  border-radius: 8px;
  background: linear-gradient(91deg, #2f2e64 12.85%, #8666c9 104.19%);
  box-shadow: none;
  border: none;
  overflow: hidden;
  color: #fff;
  padding: 40px;
  padding-right: 105px;

  @media screen and (max-width: 880px) {
    padding: 12px;

    ${Decoration} {
      display: none;
    }
  }
`
const PositionDataWrapper = styled.div`
  display: grid;
  // grid-template-columns: repeat(5, 1fr);
  // grid-template-areas: 'address rank score trades volume';

  grid-template-columns: repeat(2, 1fr);
  grid-template-areas: 'address score';

  @media screen and (max-width: 600px) {
    grid-template-columns: 1.5fr 1fr 1fr;
  }
`

const DataItem = styled(Flex)`
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  padding: 0 15%;

  &:first-child {
    padding: 0;
  }

  &:not(:first-child):not(:last-child):after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);
    background: rgba(217, 217, 217, 0.2);
    width: 1px;
    height: 75%;
  }
`

const DataItemTitle = styled(TYPE.main)`
  font-size: 20px !important;
  white-space: nowrap;

  @media screen and (max-width: 880px) {
    font-size: 16px !important;
  }
`
const DataItemValue = styled(TYPE.main)`
  font-size: 18px !important;
  white-space: nowrap;

  @media screen and (max-width: 880px) {
    font-size: 14px !important;
  }
`
const ErrorContainer = styled.div`
  border-radius: 8px;
  background: linear-gradient(91deg, #2F2E64 12.85%, #8666C9 104.19%);
  color: white;
  text-align: center;
  padding: 20px;
`
const ErrorHeader = styled.div`
  font-size: 20px;
  font-weight: 700;
`
const ErrorText = styled.div`
  font-size: 16px;
  font-weight: 500;
`

function VolumeLeaderboardPosition({ position, searchError, onClearSearch }) {
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
              <DataItemValue>{shortenStraknetAddress(position.address, 4)}</DataItemValue>
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

export default withRouter(VolumeLeaderboardPosition)
