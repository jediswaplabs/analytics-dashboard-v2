import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Star } from 'react-feather'
import { useMedia } from 'react-use'
import styled from 'styled-components'
import { isEmpty } from 'lodash'

import { PageWrapper, StyledIcon, BlockedWrapper, BlockedMessageWrapper, ContentWrapper, Hover, PageHeader } from '../components'
import { PanelTopLight } from '../components/Panel'
import Loader from '../components/LocalLoader'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import { AutoColumn } from '../components/Column'
import { ButtonDark, OptionButton, OptionButtonGroup } from '../components/ButtonStyled'
import Link from '../components/Link'
import { BasicLink } from '../components/Link'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import Warning from '../components/Warning'
import FormattedName from '../components/FormattedName'

import { formattedNum, formattedPercent, getPoolLink, getSwapLink, urls } from '../utils'
import { useColor } from '../hooks'
import { TYPE } from '../Theme'

import { usePathDismissed, useSavedPairs } from '../contexts/LocalStorage'

import { useWhitelistedTokens } from '../contexts/Application'
import { BLOCKED_WARNINGS } from '../constants'

import backArrow from '../assets/back_arrow.svg'
import { usePairData } from '../contexts/PairData'
import FeeBadge from '../components/FeeBadge'

const DashboardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`

const LoaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
    align-items: stretch;
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

const PairDataPanelWrapper = styled.div`
  background: #141451;
  border-radius: 4px;
  padding: 20px;

  grid-template-columns: 1fr 0.2fr 1fr;
  grid-template-rows: max-content;
  gap: 12px;
  display: inline-grid;
  width: 100%;
  align-items: start;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
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

const FixedPanel = styled.div`
  width: fit-content;
  padding: 12px 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

function PairPage({ pairAddress, history }) {
  const {
    poolAddress,
    token0,
    token1,
    fee,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    totalValueLockedUSD,
    liquidityChangeUSD,
    oneDayFeesUSD,
    feesChangeUSD,
    totalValueLockedToken0,
    totalValueLockedToken1,
    token0Price,
    token1Price,
    loadingEnd
  } = usePairData(pairAddress)
  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const feePercent = (fee ? parseFloat(fee) / 10000 : 0) + '%'

  const [currentPriceDisplayMode, setCurrentPriceDisplayMode] = useState('token0')

  const backgroundColor = useColor(pairAddress)

  const formattedLiquidity = formattedNum(totalValueLockedUSD, true)
  const liquidityChange = formattedPercent(liquidityChangeUSD)

  // volume
  const volume = !!oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : formattedNum(oneDayVolumeUntracked, true)
  const usingUtVolume = oneDayVolumeUSD === 0 && !!oneDayVolumeUntracked
  const volumeChange = formattedPercent(!usingUtVolume ? volumeChangeUSD : volumeChangeUntracked)

  const feesChange = formattedPercent(feesChangeUSD)

  // formatted symbols for overflow
  const formattedSymbol0 = token0?.symbol.length > 6 ? token0?.symbol.slice(0, 5) + '...' : token0?.symbol
  const formattedSymbol1 = token1?.symbol.length > 6 ? token1?.symbol.slice(0, 5) + '...' : token1?.symbol

  const below1024 = useMedia('(max-width: 1024px)')
  const below800 = useMedia('(max-width: 800px)')
  const below600 = useMedia('(max-width: 600px)')

  const [dismissed, markAsDismissed] = usePathDismissed(history.location.pathname)

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const [savedPairs, addPair, removePair] = useSavedPairs()

  const whitelistedTokens = useWhitelistedTokens()
  const areTokensWhitelisted = !!(whitelistedTokens[token0?.tokenAddress] && whitelistedTokens[token1?.tokenAddress])
  const actionButtonsMarkup = (
    <RowFixed align="center" style={{ gap: '8px' }}>
      <Link external href={getPoolLink(token0?.tokenAddress, token1?.tokenAddress, fee)}>
        <ButtonDark color={backgroundColor}>+ Add Liquidity</ButtonDark>
      </Link>
      <Link external href={getSwapLink(token0?.tokenAddress, token1?.tokenAddress)}>
        <ButtonDark color={backgroundColor}>Trade</ButtonDark>
      </Link>
    </RowFixed>
  )


  if (!loadingEnd) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    )
  }

  if (!areTokensWhitelisted) {
    return (
      <BlockedWrapper>
        <BlockedMessageWrapper>
          <AutoColumn gap="1rem" justify="center">
            <TYPE.light color="#fff" style={{ textAlign: 'center' }}>
              {BLOCKED_WARNINGS[pairAddress] ?? `This pair is not supported.`}
            </TYPE.light>
            <Link external={true} href={urls.showAddress(pairAddress)}>{`More about ${pairAddress}`}</Link>
          </AutoColumn>
        </BlockedMessageWrapper>
      </BlockedWrapper>
    )
  }


  return (
    <PageWrapper>
      <PageHeader>
        <RowBetween style={{ flexWrap: 'wrap', alingItems: 'start' }}>
          <AutoRow align="flex-end" style={{ width: 'fit-content' }}>
            {!below1024 && (
              <TYPE.breadCrumbs fontSize={'16px'} fontWeight={'500'} lineHeight={1} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <BasicLink to="/pools">{'Home > Pools '}</BasicLink>
                <span style={{ color: 'white' }}>{'>'}</span>
                <span style={{ color: 'white' }}>
                  {token0?.symbol}-{token1?.symbol}
                </span>
                <FeeBadge>{feePercent}</FeeBadge>
              </TYPE.breadCrumbs>
            )}
            {below1024 && (
              <BasicLink to="/pools" style={{ color: '#50D5FF', fontSize: '0.67rem', display: 'flex' }}>
                <img src={backArrow} style={{ marginRight: '0.3rem' }} />
                Back to pools
              </BasicLink>
            )}
          </AutoRow>
        </RowBetween>

        <RowBetween>
          <RowFixed align="center" style={{ gap: '8px' }}>
            {token0 && token1 && (
              <DoubleTokenLogo a0={token0?.tokenAddress || ''} a1={token1?.tokenAddress || ''} size={24} style={{ alignSelf: 'center' }} />
            )}
            <TYPE.main fontSize={below600 ? '16px' : '20px'} fontWeight={700}>
              {token0 && token1 ? (
                <>
                  <HoverSpan onClick={() => history.push(`/token/${token0?.tokenAddress}`)}>{token0.symbol}</HoverSpan>
                  <span>-</span>
                  <HoverSpan onClick={() => history.push(`/token/${token1?.tokenAddress}`)}>{token1.symbol}</HoverSpan>
                </>
              ) : (
                ''
              )}
            </TYPE.main>
            <FeeBadge>{feePercent}</FeeBadge>
          </RowFixed>

          <RowFixed align="center" style={{ gap: '8px' }}>
            <Hover
              onClick={() =>
                savedPairs[pairAddress]
                  ? removePair(pairAddress)
                  : addPair(pairAddress, token0.tokenAddress, token1.tokenAddress, token0.symbol, token1.symbol)
              }
            >
              <StyledIcon style={{ display: 'flex' }}>
                <Star fill={savedPairs[pairAddress] ? '#fff' : 'transparent'} />
              </StyledIcon>
            </Hover>
            {!below600 && actionButtonsMarkup}
          </RowFixed>
        </RowBetween>
        {below600 && actionButtonsMarkup}
      </PageHeader>
      <ContentWrapper>
        <Warning
          type={'pair'}
          show={!dismissed && !isEmpty(whitelistedTokens) && !areTokensWhitelisted}
          setShow={markAsDismissed}
          address={pairAddress}
        />
        <DashboardWrapper>
          <AutoColumn style={{ gap: '12px' }}>
            <PanelWrapper>
              <PanelTopLight>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.subHeader>Total Liquidity</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween align="baseline">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {formattedLiquidity}
                    </TYPE.main>
                    <TYPE.main fontSize="1rem">{liquidityChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </PanelTopLight>
              <PanelTopLight>
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
              </PanelTopLight>
              <PanelTopLight>
                <AutoColumn gap="20px">
                  <RowBetween>
                    <TYPE.subHeader>Total fees (24hr)</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween align="baseline">
                    <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={500}>
                      {formattedNum(oneDayFeesUSD, true)}
                    </TYPE.main>
                    <TYPE.main fontSize="1rem">{feesChange}</TYPE.main>
                  </RowBetween>
                </AutoColumn>
              </PanelTopLight>
            </PanelWrapper>

            <PairDataPanelWrapper>
              <AutoColumn gap="12px">
                <RowBetween>
                  <TYPE.main fontSize="16px" fontWeight={500}>
                    Total Tokens Locked:
                  </TYPE.main>
                </RowBetween>
                <div style={{ display: 'flex', gap: '20px', flexDirection: below800 ? 'column' : 'row' }}>
                  <FixedPanel onClick={() => history.push(`/token/${token0?.tokenAddress}`)} style={{ width: '100%' }}>
                    <AutoRow gap={'4px'}>
                      <TokenLogo address={token0?.tokenAddress} />
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {totalValueLockedToken0 ? formattedNum(totalValueLockedToken0) : ''}{' '}
                          <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                    </AutoRow>
                  </FixedPanel>
                  <FixedPanel onClick={() => history.push(`/token/${token1?.tokenAddress}`)} style={{ width: '100%' }}>
                    <AutoRow gap={'4px'}>
                      <TokenLogo address={token1?.tokenAddress} />
                      <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                        <RowFixed>
                          {totalValueLockedToken1 ? formattedNum(totalValueLockedToken1) : ''}{' '}
                          <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} margin={true} />
                        </RowFixed>
                      </TYPE.main>
                    </AutoRow>
                  </FixedPanel>
                </div>
              </AutoColumn>
              <span></span>
              <AutoColumn gap="12px">
                <RowBetween style={{ position: 'relative' }}>
                  <TYPE.main fontSize="16px" fontWeight={500}>
                    Current Price:
                  </TYPE.main>

                  <OptionButtonGroup style={{ position: 'absolute', right: 0 }}>
                    <OptionButton active={currentPriceDisplayMode === 'token0'} onClick={() => setCurrentPriceDisplayMode('token0')}>
                      {token0.symbol}
                    </OptionButton>
                    <OptionButton active={currentPriceDisplayMode === 'token1'} onClick={() => setCurrentPriceDisplayMode('token1')}>
                      {token1.symbol}
                    </OptionButton>
                  </OptionButtonGroup>
                </RowBetween>

                <div style={{ display: 'flex', gap: '20px' }}>
                  {currentPriceDisplayMode === 'token0' && (
                    <FixedPanel onClick={() => history.push(`/token/${token0?.tokenAddress}`)} style={{ width: '100%' }}>
                      <AutoRow gap={'4px'}>
                        <TokenLogo address={token0?.tokenAddress} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>{token0 && token1 ? `1 ${formattedSymbol0} = ${formattedNum(token1Price)} ${formattedSymbol1}` : '-'}</RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </FixedPanel>
                  )}
                  {currentPriceDisplayMode === 'token1' && (
                    <FixedPanel onClick={() => history.push(`/token/${token1?.tokenAddress}`)} style={{ width: '100%' }}>
                      <AutoRow gap={'4px'}>
                        <TokenLogo address={token1?.tokenAddress} />
                        <TYPE.main fontSize={20} lineHeight={1} fontWeight={500}>
                          <RowFixed>{token0 && token1 ? `1 ${formattedSymbol1} = ${formattedNum(token0Price)} ${formattedSymbol0}` : '-'}</RowFixed>
                        </TYPE.main>
                      </AutoRow>
                    </FixedPanel>
                  )}
                </div>
              </AutoColumn>
            </PairDataPanelWrapper>
          </AutoColumn>
        </DashboardWrapper>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
