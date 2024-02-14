import React, { useState } from 'react'
import 'feather-icons'
import { withRouter } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import Link from '../components/Link'
import Panel from '../components/Panel'
import TokenLogo from '../components/TokenLogo'
import PairList from '../components/PairList'
import Loader from '../components/LocalLoader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import { AutoColumn } from '../components/Column'
import { ButtonDark } from '../components/ButtonStyled'
import { BasicLink } from '../components/Link'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink, localNumber, urls } from '../utils'
import { useTokenData, useTokenPairs } from '../contexts/TokenData'
import { TYPE } from '../Theme'
import { useColor } from '../hooks'
import { useMedia } from 'react-use'
import { usePairDataForList } from '../contexts/PairData'
import { useEffect } from 'react'
import Warning from '../components/Warning'
import { usePathDismissed, useSavedTokens } from '../contexts/LocalStorage'
import { Hover, PageWrapper, ContentWrapper, StyledIcon, BlockedWrapper, BlockedMessageWrapper, PageSection } from '../components'
import { AlertCircle, Star } from 'react-feather'
import { useListedTokens, useWhitelistedTokens } from '../contexts/Application'
import { BLOCKED_WARNINGS } from '../constants'
import { shortenStraknetAddress } from '../utils'
import backArrow from '../../src/assets/back_arrow.svg'

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`

const PanelWrapper = styled.div`
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: max-content;
  gap: 12px;
  display: inline-grid;
  width: 100%;
  align-items: start;
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    //align-items: stretch;
    > * {
      /* grid-column: 1 / 4; */
    }

    > * {
      &:first-child {
        width: 100%;
      }
    }
  }
`
const LoaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto 1fr;
  column-gap: 30px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      /* grid-column: 1 / 4; */
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

const WarningIcon = styled(AlertCircle)`
  stroke: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;
  opacity: 0.6;
`

const WarningGrouping = styled.div`
  opacity: ${({ disabled }) => disabled && '0.4'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
`

function TokenPage({ address, history }) {
  const {
    tokenAddress,
    name,
    symbol,
    oneDayFees,
    feesChangeUSD,
    priceUSD,
    oneDayVolumeUSD,
    totalLiquidityUSD,
    volumeChangeUSD,
    priceChangeUSD,
    liquidityChangeUSD,
    txnChange,
  } = useTokenData(address)

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  // detect color from token
  const backgroundColor = useColor(tokenAddress, symbol)

  const allPairs = useTokenPairs(address)

  const allPairsIds = allPairs?.map((p) => p.poolAddress) ?? []

  // pairs to show in pair list
  const fetchedPairsList = usePairDataForList(allPairsIds)
  const formattedPairListData =
    fetchedPairsList?.reduce((acc, v) => {
      acc[v.poolAddress] = v
      return acc
    }, {}) ?? {}

  // price
  const price = priceUSD ? formattedNum(priceUSD, true) : ''
  const priceChange = priceChangeUSD ? formattedPercent(priceChangeUSD) : ''

  // fees
  const fees = formattedNum(oneDayFees, true)
  const feesChange = formattedPercent(feesChangeUSD)

  // volume
  const volume = formattedNum(oneDayVolumeUSD, true)
  const volumeChange = formattedPercent(volumeChangeUSD)

  // liquidity
  const liquidity = formattedNum(totalLiquidityUSD, true)
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // transactions
  const txnChangeFormatted = formattedPercent(txnChange)

  const below1024 = useMedia('(max-width: 1024px)')
  const below600 = useMedia('(max-width: 600px)')

  // format for long symbol
  const LENGTH = below1024 ? 10 : 16
  const formattedSymbol = symbol?.length > LENGTH ? symbol.slice(0, LENGTH) + '...' : symbol

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)
  const [savedTokens, addToken, removeToken] = useSavedTokens()

  const listedTokens = useListedTokens()
  const whitelistedTokens = useWhitelistedTokens()
  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  if (!tokenAddress) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    )
  }

  if (!whitelistedTokens[address]) {
    return (
      <BlockedWrapper>
        <BlockedMessageWrapper>
          <AutoColumn gap="1rem" justify="center">
            <TYPE.light color="#fff" style={{ textAlign: 'center' }}>
              {BLOCKED_WARNINGS[address] ?? `This token is not supported.`}
            </TYPE.light>
            <Link external={true} href={urls.showAddress(address)}>{`More about ${address}`}</Link>
          </AutoColumn>
        </BlockedMessageWrapper>
      </BlockedWrapper>
    )
  }

  const priceAndPriceChangeMarkup = (
    <RowFixed align="baseline" style={{ gap: '8px' }}>
      <TYPE.main fontWeight={500} fontSize={below600 ? '16px' : '24px'}>
        {price}
      </TYPE.main>
      <TYPE.main fontWeight={500} fontSize={below600 ? '14px' : '16px'}>
        {priceChange}
      </TYPE.main>
    </RowFixed>
  )
  const actionButtonsMarkup = (
    <RowFixed align="center" style={{ gap: '8px' }}>
      <Link href={getPoolLink(address)} target="_blank">
        <ButtonDark color={backgroundColor}>+ Add Liquidity</ButtonDark>
      </Link>
      <Link href={getSwapLink(address)} target="_blank">
        <ButtonDark color={backgroundColor}>Trade</ButtonDark>
      </Link>
    </RowFixed>
  )
  return (
    <PageWrapper>
      <Warning type={'token'} show={!dismissed && listedTokens && !listedTokens.includes(address)} setShow={markAsDismissed} address={address} />
      <ContentWrapper>
        <RowBetween style={{ flexWrap: 'wrap', alingItems: 'start' }}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            {!below1024 && (
              <TYPE.breadCrumbs fontSize={'16px'} fontWeight={'500'} lineHeight={1} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <BasicLink to="/tokens">{'Home > Tokens '}</BasicLink>
                <span style={{ color: 'white' }}>{'>'}</span>
                <span style={{ color: 'white' }}>{symbol}</span>
              </TYPE.breadCrumbs>
            )}
            {below1024 && (
              <BasicLink to="/tokens" style={{ color: '#50D5FF', fontSize: '0.67rem', display: 'flex' }}>
                <img src={backArrow} style={{ marginRight: '0.3rem' }} />
                Back to tokens
              </BasicLink>
            )}
          </AutoRow>
        </RowBetween>
        <WarningGrouping disabled={!dismissed && listedTokens && !listedTokens.includes(address)}>
          <DashboardWrapper>
            <AutoColumn style={{ gap: '8px' }}>
              <RowBetween>
                <RowFixed align="center" style={{ gap: '8px' }}>
                  <TokenLogo address={address} symbol={symbol} size="24px" style={{ alignSelf: 'center' }} />
                  <TYPE.main fontSize={below600 ? '16px' : '20px'} fontWeight={700}>
                    {formattedSymbol ? `${formattedSymbol}` : ''}
                  </TYPE.main>
                  {below600 && priceAndPriceChangeMarkup}
                </RowFixed>

                <RowFixed align="center" style={{ gap: '8px' }}>
                  <Hover onClick={() => (savedTokens[address] ? removeToken(address) : addToken(address, symbol))}>
                    <StyledIcon style={{ display: 'flex' }}>
                      <Star fill={savedTokens[address] ? '#fff' : ''} />
                    </StyledIcon>
                  </Hover>
                  {!below600 && actionButtonsMarkup}
                </RowFixed>
              </RowBetween>
              {!below600 && priceAndPriceChangeMarkup}
              {below600 && actionButtonsMarkup}
            </AutoColumn>

            <AutoColumn style={{ gap: '32px' }}>
              <PanelWrapper>
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.subHeader>Total Liquidity</TYPE.subHeader>
                    </RowBetween>
                    <RowBetween align="baseline">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {liquidity}
                      </TYPE.main>
                      <TYPE.main fontSize="1rem">{liquidityChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.subHeader>Volume (24hr)</TYPE.subHeader>
                      <div />
                    </RowBetween>
                    <RowBetween align="baseline">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {volume}
                      </TYPE.main>
                      <TYPE.main fontSize="1rem">{volumeChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
                <Panel>
                  <AutoColumn gap="20px">
                    <RowBetween>
                      <TYPE.subHeader>Total fees (24hr)</TYPE.subHeader>
                      <div />
                    </RowBetween>
                    <RowBetween align="baseline">
                      <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                        {fees}
                      </TYPE.main>
                      <TYPE.main fontSize="1rem">{feesChange}</TYPE.main>
                    </RowBetween>
                  </AutoColumn>
                </Panel>
              </PanelWrapper>

              <PageSection>
                <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
                  Available Pools
                </TYPE.main>
                <Panel style={{ padding: '0' }}>
                  <PairList color={backgroundColor} address={address} pairs={formattedPairListData} />
                </Panel>
              </PageSection>
            </AutoColumn>
          </DashboardWrapper>
        </WarningGrouping>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(TokenPage)
