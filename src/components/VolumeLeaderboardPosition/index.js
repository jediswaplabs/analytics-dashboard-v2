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

const Wrapper = styled.div`
  display: grid;
  gap: 30px;

  @media screen and (max-width: 1080px) {
    gap: 16px;
  }
`

const Decoration = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  max-width: 100%;
  width: 111px;
  z-index: 0;
`

const PositionPanel = styled(Panel)`
  border-radius: 8px;
  background: linear-gradient(91deg, #2f2e64 12.85%, #8666c9 104.19%);
  box-shadow: none;
  border: none;
  overflow: hidden;
  color: #fff;
  padding: 40px;
  padding-right: 125px;

  @media screen and (max-width: 880px) {
    padding: 12px;

    ${Decoration} {
      display: none;
    }
  }
`
const PositionDataWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: 'address rank score trades volume';
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

function VolumeLeaderboardPosition({ position }) {
  return (
    <Wrapper>
      <PositionPanel>
        <PositionDataWrapper>
          <DataItem area={'address'}>
            <TYPE.main fontSize={'20px'}>Address</TYPE.main>
            <TYPE.main fontSize={'18px'}>{shortenStraknetAddress(position.address, 4)}</TYPE.main>
          </DataItem>
          <DataItem area={'rank'}>
            <TYPE.main fontSize={'20px'}>Rank</TYPE.main>
            <TYPE.main fontSize={'18px'}>{position.rank}</TYPE.main>
          </DataItem>
          <DataItem area={'score'}>
            <TYPE.main fontSize={'20px'}>Score</TYPE.main>
            <TYPE.main fontSize={'18px'}>{position.score}</TYPE.main>
          </DataItem>
          <DataItem area={'trades'}>
            <TYPE.main fontSize={'20px'}>Trades</TYPE.main>
            <TYPE.main fontSize={'18px'}>{position.tradesCount}</TYPE.main>
          </DataItem>
          <DataItem area={'volume'}>
            <TYPE.main fontSize={'20px'}>Volume ($)</TYPE.main>
            <TYPE.main fontSize={'18px'}>{formattedNum(position.volumeUSD, true)}</TYPE.main>
          </DataItem>
        </PositionDataWrapper>
        <Decoration src={cupImage} srcSet={cupImage + ' 1x,' + cupImage_x2 + ' 2x'} alt={''} />
      </PositionPanel>
    </Wrapper>
  )
}

export default withRouter(VolumeLeaderboardPosition)
