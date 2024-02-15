import React, { useState, useEffect, useMemo } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { Divider } from '../../components'
import { withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils'
import DoubleTokenLogo from '../DoubleLogo'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { AutoColumn } from '../Column'
import { useWhitelistedTokens } from '../../contexts/Application'
import Row, { AutoRow, RowFixed } from '../Row'
import FeeBadge from '../FeeBadge'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  color: ${({ theme }) => theme.jediGrey};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  font-size: 30px;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`
const PlaceholderContainer = styled.div`
  padding: 20px;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';
  padding: 0 1.125rem;

  opacity: ${({ fade }) => (fade ? '0.6' : '1')};

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 20px;
    }
  }

  @media screen and (min-width: 740px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.7fr 1fr 1fr};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    padding: 0 1.125rem;
    grid-template-columns: 1.7fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.7fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = (field, useTracked) => {
  switch (field) {
    case SORT_FIELD.LIQ:
      return useTracked ? 'trackedReserveUSD' : 'reserveUSD'
    case SORT_FIELD.VOL:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    case SORT_FIELD.VOL_7DAYS:
      return useTracked ? 'oneWeekVolumeUSD' : 'oneWeekVolumeUntracked'
    case SORT_FIELD.FEES:
      return useTracked ? 'oneDayVolumeUSD' : 'oneDayVolumeUntracked'
    default:
      return 'trackedReserveUSD'
  }
}

const formatDataText = (value, trackedValue, supressWarning = false, textAlign = 'right') => {
  const showUntracked = value !== '$0' && !trackedValue & !supressWarning
  return (
    <AutoColumn gap="2px" style={{ opacity: showUntracked ? '0.7' : '1' }}>
      <div style={{ textAlign }}>{value}</div>
      <TYPE.light fontSize={'9px'} style={{ textAlign: 'right' }}>
        {/* {showUntracked ? 'untracked' : '  '} */}
        {showUntracked ? '' : '  '}
      </TYPE.light>
    </AutoColumn>
  )
}

const DEFAULT_NO_PAIRS_PLACEHOLDER_TEXT = 'Pairs will appear here'

function PairList({
  pairs,
  color,
  disbaleLinks,
  maxItems = 10,
  useTracked = false,
  waitForData = true,
  noPairsPlaceholderText = DEFAULT_NO_PAIRS_PLACEHOLDER_TEXT,
}) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')
  const whitelistedTokens = useWhitelistedTokens()
  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  const filteredPairsAddresses = useMemo(() => {
    return (
      pairs &&
      Object.keys(pairs).filter((address) => {
        return whitelistedTokens[pairs[address].token0.tokenAddress] && whitelistedTokens[pairs[address].token1.tokenAddress]
      })
    )
  }, [pairs, whitelistedTokens])

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (filteredPairsAddresses) {
      let extraPages = 1
      if (filteredPairsAddresses.length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(filteredPairsAddresses.length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, filteredPairsAddresses])

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress]
    const feePercent = (pairData ? parseFloat(pairData.fee) / 10000 : 0) + '%'

    if (pairData && pairData.token0 && pairData.token1) {
      const feeTier = pairData.fee / 10 ** 6
      const liquidity = formattedNum(!!pairData.trackedReserveUSD ? pairData.trackedReserveUSD : pairData.reserveUSD, true)

      const volume = formattedNum(pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked, true)

      const feeRatio24H =
        ((pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked) * feeTier) /
        (pairData.oneDayVolumeUSD ? pairData.trackedReserveUSD : pairData.reserveUSD)
      const apy = ((1 + feeRatio24H) ** 365 - 1) * 100
      const cleanedApy = (isNaN(apy) || !isFinite(apy)) ? 0 : apy
      const displayApy = formattedPercent(cleanedApy, true)

      const weekVolume = formattedNum(pairData.oneWeekVolumeUSD ? pairData.oneWeekVolumeUSD : pairData.oneWeekVolumeUntracked, true)

      const fees = formattedNum(pairData.oneDayFeesUSD, true)
      if (below1080) {
        return (
          <div style={{ margin: '10px 0', padding: '20px', borderRadius: '8px', border: '1px solid #959595' }}>
            <div style={{ display: 'flex' }}>
              <DoubleTokenLogo
                size={below600 ? 16 : 20}
                a0={pairData.token0.tokenAddress}
                a1={pairData.token1.tokenAddress}
                s0={pairData.token0.symbol}
                s1={pairData.token1.symbol}
                margin
              />
              <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
                <CustomLink to={'/pool/' + pairAddress} color={color}>
                  <FormattedName
                    text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                    maxCharacters={below600 ? 8 : 16}
                    adjustSize={true}
                    link={true}
                  />
                </CustomLink>
                <FeeBadge>{feePercent}</FeeBadge>
              </AutoRow>
            </div>
            <div style={{ color: 'white', display: 'flex', columnGap: '30px', marginTop: '10px' }}>
              <div>
                <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Liquidity</div>
                <div>{formatDataText(liquidity, pairData.trackedReserveUSD, false, 'left')}</div>
              </div>
              <div>
                <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Volume (24H)</div>
                <div>{formatDataText(volume, pairData.oneDayVolumeUSD, false, 'left')}</div>
              </div>
              <div>
                <div style={{ color: '#9B9B9B', fontSize: '12px' }}>Fees (24H)</div>
                <div>{formatDataText(fees, pairData.oneDayVolumeUSD, false, 'left')}</div>
              </div>
            </div>
          </div>
        )
      }
      return (
        <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
          <DataText area="name" fontWeight="500">
            {!below600 && <div style={{ marginRight: '20px', width: '10px' }}>{index}</div>}
            <DoubleTokenLogo
              size={below600 ? 16 : 20}
              a0={pairData.token0.tokenAddress}
              a1={pairData.token1.tokenAddress}
              s0={pairData.token0.symbol}
              s1={pairData.token1.symbol}
              margin
            />
            <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
              <CustomLink to={'/pool/' + pairAddress} color={color}>
                <FormattedName
                  text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                  maxCharacters={below600 ? 8 : 16}
                  adjustSize={true}
                  link={true}
                />
              </CustomLink>
              <FeeBadge>{feePercent}</FeeBadge>
            </AutoRow>
          </DataText>
          <DataText area="liq">{formatDataText(liquidity, pairData.trackedReserveUSD)}</DataText>
          <DataText area="vol">{formatDataText(volume, pairData.oneDayVolumeUSD)}</DataText>
          {!below1080 && <DataText area="volWeek">{formatDataText(weekVolume, pairData.oneWeekVolumeUSD)}</DataText>}
          {!below1080 && <DataText area="fees">{formatDataText(fees, pairData.oneDayVolumeUSD)}</DataText>}
          {!below1080 && <DataText area="apy">{formatDataText(displayApy, pairData.oneDayVolumeUSD, pairData.oneDayVolumeUSD === 0)}</DataText>}
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const pairList =
    filteredPairsAddresses &&
    filteredPairsAddresses
      .filter((address) => (useTracked ? !!pairs[address].trackedReserveUSD : true))
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        if (sortedColumn === SORT_FIELD.APY) {
          const pairAFeeRation24H =
            ((pairA.oneDayVolumeUSD ? pairA.oneDayVolumeUSD : pairA.oneDayVolumeUntracked) * 0.003) /
            (pairA.oneDayVolumeUSD ? pairA.trackedReserveUSD : pairA.reserveUSD)
          const pairBFeeRation24H =
            ((pairB.oneDayVolumeUSD ? pairB.oneDayVolumeUSD : pairB.oneDayVolumeUntracked) * 0.003) /
            (pairB.oneDayVolumeUSD ? pairB.trackedReserveUSD : pairB.reserveUSD)
          const apy0 = parseFloat(((1 + pairAFeeRation24H) ** 365 - 1) * 100)
          const apy1 = parseFloat(((1 + pairBFeeRation24H) ** 365 - 1) * 100)
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE(sortedColumn, useTracked)]) > parseFloat(pairB[FIELD_TO_VALUE(sortedColumn, useTracked)])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={index}>
              <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
              {!below1080 && <Divider />}
            </div>
          )
        )
      })

  if (!pairList) {
    return <LocalLoader />
  }

  if (waitForData && !pairList.length) {
    return <LocalLoader />
  }

  if (!waitForData && !pairList.length) {
    return (
      <PlaceholderContainer>
        <TYPE.main fontSize={'16px'} fontWeight={'400'}>
          {noPairsPlaceholderText}
        </TYPE.main>
      </PlaceholderContainer>
    )
  }

  return (
    <ListWrapper>
      {!below1080 && (
        <>
          <DashGrid
            center={true}
            disbaleLinks={disbaleLinks}
            style={{ height: 'fit-content', padding: '1rem 1.125rem 1rem 1.125rem', backgroundColor: '#ffffff33' }}
          >
            <Flex alignItems="center" justifyContent="flexStart">
              <TYPE.main area="name">Name</TYPE.main>
            </Flex>
            <Flex alignItems="center" justifyContent="flexEnd">
              <ClickableText
                area="liq"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.LIQ)
                  setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
                }}
              >
                Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area="vol"
                onClick={(e) => {
                  setSortedColumn(SORT_FIELD.VOL)
                  setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
                }}
              >
                Volume (24H)
                {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="volWeek"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.VOL_7DAYS)
                    setSortDirection(sortedColumn !== SORT_FIELD.VOL_7DAYS ? true : !sortDirection)
                  }}
                >
                  Volume (7D) {sortedColumn === SORT_FIELD.VOL_7DAYS ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
            {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="fees"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.FEES)
                    setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
                  }}
                >
                  Fees (24H) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
            {!below1080 && (
              <Flex alignItems="center" justifyContent="flexEnd">
                <ClickableText
                  area="apy"
                  onClick={(e) => {
                    setSortedColumn(SORT_FIELD.APY)
                    setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection)
                  }}
                >
                  1 yr Fee/Liquidity {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
                </ClickableText>
              </Flex>
            )}
          </DashGrid>
          <Divider />
        </>
      )}
      <List p={0}>{pairList}</List>
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
    </ListWrapper>
  )
}

export default withRouter(PairList)
