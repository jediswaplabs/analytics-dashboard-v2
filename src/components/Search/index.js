import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import styled, { css } from 'styled-components'

import Row, { AutoRow, RowFixed } from '../Row'
import TokenLogo from '../TokenLogo'
import { Divide, Search as SearchIcon, Star, X } from 'react-feather'
import { BasicLink, CustomLink } from '../Link'

import { useAllTokenData } from '../../contexts/TokenData'
import { useAllPairData } from '../../contexts/PairData'
import DoubleTokenLogo from '../DoubleLogo'
import { useMedia } from 'react-use'
import { useAllPairsInJediswap, useAllTokensInJediswap } from '../../contexts/GlobalData'

import { transparentize } from 'polished'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { updateNameData } from '../../utils/data'
import { useWhitelistedTokens } from '../../contexts/Application'
import FeeBadge from '../FeeBadge'
import { Flex } from 'rebass'
import { formattedNum, formattedPercent } from '../../utils'
import { Divider, Hover, StyledIcon } from '../index'
import { useSavedPairs, useSavedTokens } from '../../contexts/LocalStorage'
import Column from '../Column'

const Container = styled.div`
  height: 48px;
  z-index: 30;
  position: relative;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
`

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 15px;
  padding-left: 50px;
  border-radius: 4px;
  background: ${({ theme, small, open }) => (small ? (open ? theme.bg7 : 'none') : transparentize(0.4, theme.bg7))};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '4px')};
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '4px')};
  z-index: 9999;
  width: 100%;
  min-width: 300px;
  box-sizing: border-box;
  box-shadow: ${({ open, small }) =>
    !open && !small
      ? '0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04) '
      : 'none'};
  @media screen and (max-width: 500px) {
    background: ${({ theme }) => theme.bg7};
    box-shadow: ${({ open }) =>
    !open
      ? '0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 0px 1px rgba(0, 0, 0, 0.04) '
      : 'none'};
  }
`
const Input = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  width: 100%;
  color: #fff;
  font-size: 16px;

  ::placeholder {
    color: #959595;
    font-size: 16px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const SearchIconLarge = styled(SearchIcon)`
  height: 20px;
  width: 20px;
  position: absolute;
  transform: translate(0, -50%);
  left: 15px;
  top: 50%;
  pointer-events: none;
  color: ${({ theme }) => theme.text3};
`

const CloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  position: absolute;
  transform: translate(0, -50%);
  top: 50%;
  right: 15px;
  color: ${({ theme }) => theme.text3};
  :hover {
    cursor: pointer;
  }
`
const KeyShortCut = styled.div`
  color: ${({ theme }) => theme.text3};
  font-size: 20px;
  line-height: 1;
  position: absolute;
  transform: translate(0, -50%);
  top: 50%;
  right: 15px;
`
const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-height: 540px;
  z-index: 9999;
  overflow: auto;
  padding: 32px;
  //padding-bottom: 20px;
  border-radius: 8px;
  border: 2px solid #7e3ee4;
  background: #141451;
  display: ${({ hide }) => hide && 'none'};

  @media screen and (max-width: 640px) {
    padding: 12px;
  }
`

const MenuItem = styled(Row)`
  padding: 1rem;
  font-size: 0.85rem;
  & > * {
    margin-right: 6px;
  }
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg2};
  }
`

const Heading = styled(Row)`
  //padding: 1rem;
  font-size: 12px;
  display: ${({ hide = false }) => hide && 'none'};
`

const Gray = styled.span`
  color: #888d9b;
`

const Blue = styled.span`
  color: #50d5ff;
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

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`
const TableRowsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const DashGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  grid-template-areas: 'name liquidity volume price';

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text1} !important;
  font-size: 16px;
  & > * {
    font-size: 16px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const tabsLookup = {
  search: 'search',
  watchlist: 'watchlist',
}

export const Search = ({ small = false }) => {
  let allTokens = useAllTokensInJediswap()
  const allTokenData = useAllTokenData()
  const [savedPairs, addPair, removePair] = useSavedPairs()
  const savedPairsKeys = savedPairs ? Object.keys(savedPairs).filter((k) => !!savedPairs[k]) : []
  const [savedTokens, addToken, removeToken] = useSavedTokens()
  const savedTokensKeys = savedTokens ? Object.keys(savedTokens).filter((k) => !!savedTokens[k]) : []
  let allPairs = useAllPairsInJediswap()
  const allPairData = useAllPairData()

  const allSavedPairsData =
    savedPairsKeys
      ?.map((poolAddress) => {
        return allPairData[poolAddress] ?? null
      })
      .filter(Boolean) ?? []

  const allSavedTokensData =
    savedTokensKeys
      ?.map((tokenKey) => {
        return allTokenData[tokenKey] ?? null
      })
      .filter(Boolean) ?? []

  const [activeTab, setActiveTab] = useState(tabsLookup.search)
  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const [, toggleShadow] = useState(false)
  const [, toggleBottomShadow] = useState(false)

  const whitelistedTokensRaw = useWhitelistedTokens() ?? {}
  const whitelistedTokens = useMemo(() => whitelistedTokensRaw, [Object.keys(whitelistedTokensRaw).join(',')])

  const below768 = useMedia('(max-width: 768px)')
  const below700 = useMedia('(max-width: 700px)')
  const below470 = useMedia('(max-width: 470px)')
  const below410 = useMedia('(max-width: 410px)')

  useEffect(() => {
    if (value !== '') {
      toggleMenu(true)
    } else {
      toggleMenu(false)
    }
  }, [value])

  const [searchedTokens, setSearchedTokens] = useState([])
  const [searchedPairs, setSearchedPairs] = useState([])

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  // add the searched tokens to the list if not found yet
  allTokens = allTokens.concat(
    searchedTokens.filter((searchedToken) => {
      let included = false
      updateNameData()
      allTokens.map((token) => {
        if (token.tokenAddress === searchedToken.tokenAddress) {
          included = true
        }
        return true
      })
      return !included
    })
  )

  let uniqueTokens = []
  let found = {}
  allTokens &&
    allTokens.map((token) => {
      if (!found[token.tokenAddress]) {
        found[token.tokenAddress] = true
        uniqueTokens.push(token)
      }
      return true
    })

  allPairs = allPairs.concat(
    searchedPairs.filter((searchedPair) => {
      let included = false
      allPairs.map((pair) => {
        if (pair.poolAddress === searchedPair.poolAddress) {
          included = true
        }
        return true
      })
      return !included
    })
  )

  let uniquePairs = []
  let pairsFound = {}
  allPairs &&
    allPairs.map((pair) => {
      if (!pairsFound[pair.poolAddress]) {
        pairsFound[pair.poolAddress] = true
        uniquePairs.push(pair)
      }
      return true
    })

  const filteredTokenList = useMemo(() => {
    const tokensToProcess = activeTab === tabsLookup.search ? uniqueTokens : allSavedTokensData
    return tokensToProcess?.length
      ? tokensToProcess
        .sort((a, b) => {
          const tokenA = allTokenData[a.tokenAddress]
          const tokenB = allTokenData[b.tokenAddress]
          if (tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
            return tokenA.oneDayVolumeUSD > tokenB.oneDayVolumeUSD ? -1 : 1
          }
          if (tokenA?.oneDayVolumeUSD && !tokenB?.oneDayVolumeUSD) {
            return -1
          }
          if (!tokenA?.oneDayVolumeUSD && tokenB?.oneDayVolumeUSD) {
            return tokenA?.totalLiquidity > tokenB?.totalLiquidity ? -1 : 1
          }
          return 1
        })
        .filter((token) => {
          if (!whitelistedTokens[token.tokenAddress]) {
            return false
          }
          const regexMatches = Object.keys(token).map((tokenEntryKey) => {
            const isAddress = value.slice(0, 2) === '0x'
            if (tokenEntryKey === 'tokenAddress' && isAddress) {
              return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
            }
            if (tokenEntryKey === 'symbol' && !isAddress) {
              return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
            }
            if (tokenEntryKey === 'name' && !isAddress) {
              return token[tokenEntryKey].match(new RegExp(escapeRegExp(value), 'i'))
            }
            return false
          })
          return regexMatches.some((m) => m)
        })
      : []
  }, [allTokenData, uniqueTokens, value, whitelistedTokens])

  const filteredPairList = useMemo(() => {
    const pairsToProcess = activeTab === tabsLookup.search ? uniquePairs : allSavedPairsData
    return pairsToProcess?.length
      ? pairsToProcess
        .sort((a, b) => {
          const pairA = allPairData[a.poolAddress]
          const pairB = allPairData[b.poolAddress]

          if (pairA?.totalValueLockedETH && pairB?.totalValueLockedETH) {
            return parseFloat(pairA.trackedReserveETH) > parseFloat(pairB.trackedReserveETH) ? -1 : 1
          }
          if (pairA?.totalValueLockedETH && !pairB?.totalValueLockedETH) {
            return -1
          }
          if (!pairA?.totalValueLockedETH && pairB?.totalValueLockedETH) {
            return 1
          }
          return 0
        })
        .filter((pair) => {
          if (!(whitelistedTokens[pair.token0.tokenAddress] && whitelistedTokens[pair.token1.tokenAddress])) {
            return false
          }
          if (value && value.includes(' ')) {
            const pairA = value.split(' ')[0]?.toUpperCase()
            const pairB = value.split(' ')[1]?.toUpperCase()
            return (
              (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
              (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
            )
          }
          if (value && value.includes('-')) {
            const pairA = value.split('-')[0]?.toUpperCase()
            const pairB = value.split('-')[1]?.toUpperCase()
            return (
              (pair.token0.symbol.includes(pairA) || pair.token0.symbol.includes(pairB)) &&
              (pair.token1.symbol.includes(pairA) || pair.token1.symbol.includes(pairB))
            )
          }
          const regexMatches = Object.keys(pair).map((field) => {
            const isAddress = value.slice(0, 2) === '0x'
            if (field === 'poolAddress' && isAddress) {
              return pair[field].match(new RegExp(escapeRegExp(value), 'i'))
            }
            if (field === 'token0') {
              return pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) || pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
            }
            if (field === 'token1') {
              return pair[field].symbol.match(new RegExp(escapeRegExp(value), 'i')) || pair[field].name.match(new RegExp(escapeRegExp(value), 'i'))
            }
            return false
          })
          return regexMatches.some((m) => m)
        })
      : []
  }, [allPairData, uniquePairs, activeTab, value, whitelistedTokens])

  useEffect(() => {
    if (Object.keys(filteredTokenList).length > 2) {
      toggleShadow(true)
    } else {
      toggleShadow(false)
    }
  }, [filteredTokenList])

  useEffect(() => {
    if (Object.keys(filteredPairList).length > 2) {
      toggleBottomShadow(true)
    } else {
      toggleBottomShadow(false)
    }
  }, [filteredPairList])

  const [tokensShown, setTokensShown] = useState(3)
  const [pairsShown, setPairsShown] = useState(3)

  function onDismiss() {
    setPairsShown(3)
    setTokensShown(3)
    toggleMenu(false)
    setValue('')
  }

  // refs to detect clicks outside modal
  const wrapperRef = useRef()
  const menuRef = useRef()

  const handleClick = (e) => {
    if (e.target.closest('svg')) {
      return
    }
    if (!(menuRef.current && menuRef.current.contains(e.target)) && !(wrapperRef.current && wrapperRef.current.contains(e.target))) {
      setPairsShown(3)
      setTokensShown(3)
      toggleMenu(false)
    }
  }

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === '/') {
        event.preventDefault()
        !showMenu && toggleMenu(true)
      }
    },
    [showMenu]
  )

  // close dropdown on escape
  useEffect(() => {
    const escapeKeyDownHandler = (event) => {
      if (event.key === 'Escape' && showMenu) {
        event.preventDefault()
        toggleMenu(false)
      }
    }

    document.addEventListener('keydown', escapeKeyDownHandler)

    return () => {
      document.removeEventListener('keydown', escapeKeyDownHandler)
    }
  }, [showMenu, toggleMenu])

  useEffect(() => {
    const wRef = wrapperRef?.current

    if (wRef !== null) {
      //only mount the listener when input available as ref
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      if (wRef !== null) {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [handleKeyPress, wrapperRef])

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  useEffect(() => {
    if (showMenu && wrapperRef.current) {
      wrapperRef.current.focus()
    }
  }, [showMenu])

  const PoolsListItem = ({ pairData, index }) => {
    if (!(pairData && pairData.token0 && pairData.token1)) {
      return null
    }

    const feePercent = (pairData.fee ? parseFloat(pairData.fee) / 10000 : 0) + '%'
    const feeTier = pairData.fee / 10 ** 6
    const liquidity = formattedNum(!!pairData.trackedReserveUSD ? pairData.trackedReserveUSD : pairData.reserveUSD, true)
    const volume = formattedNum(pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD : pairData.oneDayVolumeUntracked, true)
    const fees = formattedNum(pairData.oneDayVolumeUSD ? pairData.oneDayVolumeUSD * feeTier : pairData.oneDayVolumeUntracked * feeTier, true)

    return (
      <DashGrid>
        <DataText area="name" fontWeight="500">
          <Row>
            <DoubleTokenLogo
              size={below700 ? 16 : 20}
              a0={pairData.token0.tokenAddress}
              a1={pairData.token1.tokenAddress}
              s0={pairData.token0.symbol}
              s1={pairData.token1.symbol}
              margin
            />
            <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
              <CustomLink to={'/pool/' + pairData.poolAddress} style={{ fontSize: below768 ? '14px' : '16px' }}>
                <FormattedName
                  text={pairData.token0.symbol + '-' + pairData.token1.symbol}
                  maxCharacters={below700 ? 8 : 16}
                  adjustSize={true}
                  link={true}
                />
              </CustomLink>
              <FeeBadge>{feePercent}</FeeBadge>
              <Hover
                onClick={() =>
                  savedPairs[pairData.poolAddress]
                    ? removePair(pairData.poolAddress)
                    : addPair(
                      pairData.poolAddress,
                      pairData.token0.tokenAddress,
                      pairData.token1.tokenAddress,
                      pairData.token0.symbol,
                      pairData.token1.symbol
                    )
                }
              >
                <StyledIcon style={{ display: 'flex' }}>
                  <Star fill={savedPairs[pairData.poolAddress] ? '#fff' : 'transparent'} width={20} height={20} />
                </StyledIcon>
              </Hover>
            </AutoRow>
          </Row>
        </DataText>
        {!below768 && (
          <>
            <DataText area="liquidity" justifyContent="flex-end">
              {liquidity}
            </DataText>
            <DataText area="volume" justifyContent="flex-end">
              {volume}
            </DataText>
            <DataText area="price" color="text" fontWeight="500" justifyContent="flex-end">
              {fees}
            </DataText>
          </>
        )}
      </DashGrid>
    )
  }

  const TokensListItem = ({ tokenData }) => {
    if (!tokenData) {
      return null
    }
    const liquidity = formattedNum(tokenData.totalLiquidityUSD, true)
    const volume = formattedNum(tokenData.oneDayVolumeUSD, true)
    const price = formattedNum(tokenData.priceUSD, true)

    return (
      <DashGrid>
        <DataText area="name" fontWeight="500">
          <Row>
            <TokenLogo address={tokenData.tokenAddress} symbol={tokenData.symbol} margin />
            <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
              <CustomLink to={'/token/' + tokenData.tokenAddress} style={{ fontSize: '16px' }}>
                <FormattedName text={tokenData.symbol} maxCharacters={below700 ? 8 : 16} adjustSize={true} link={true} />
              </CustomLink>

              <Hover
                onClick={() =>
                  savedTokens[tokenData.tokenAddress] ? removeToken(tokenData.tokenAddress) : addToken(tokenData.tokenAddress, tokenData.symbol)
                }
              >
                <StyledIcon style={{ display: 'flex' }}>
                  <Star fill={savedTokens[tokenData.tokenAddress] ? '#fff' : 'transparent'} width={20} height={20} />
                </StyledIcon>
              </Hover>
            </AutoRow>
          </Row>
        </DataText>
        {!below768 && (
          <>
            <DataText area="liquidity" justifyContent="flex-end">
              {liquidity}
            </DataText>
            <DataText area="volume" justifyContent="flex-end">
              {volume}
            </DataText>
            <DataText area="price" color="text" fontWeight="500" justifyContent="flex-end">
              {price}
            </DataText>
          </>
        )}
      </DashGrid>
    )
  }

  return (
    <Container small={small}>
      <Wrapper open={showMenu} shadow={true} small={small}>
        <SearchIconLarge />
        <Input
          large={!small}
          type={'text'}
          ref={wrapperRef}
          placeholder={
            small
              ? ''
              : below410
                ? 'Search...'
                : below470
                  ? 'Search by...'
                  : below700
                    ? 'Search by token name...'
                    : 'Search by token name, pool name, address'
          }
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}
          onFocus={() => {
            if (!showMenu) {
              toggleMenu(true)
            }
          }}
        />
        {!showMenu ? <KeyShortCut>/</KeyShortCut> : <CloseIcon onClick={() => toggleMenu(false)} />}
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <TableWrapper>
          <TabsContainer>
            <TabItem isActive={activeTab === tabsLookup.search} onClick={() => setActiveTab(tabsLookup.search)}>
              Search
            </TabItem>
            <TabItem isActive={activeTab === tabsLookup.watchlist} onClick={() => setActiveTab(tabsLookup.watchlist)}>
              Watchlist
            </TabItem>
          </TabsContainer>
          <DashGrid>
            <Flex alignItems="center" justifyContent="flex-start">
              <TYPE.main area="name" fontSize={'16px'}>
                All tokens
              </TYPE.main>
            </Flex>
            {!below768 && (
              <>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="liquidity">Liquidity</TYPE.main>
                </Flex>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="volume">Volume (24H)</TYPE.main>
                </Flex>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="price">Price</TYPE.main>
                </Flex>
              </>
            )}
          </DashGrid>
          <TableRowsWrapper gap="20px" flexDirection={'column'}>
            {filteredTokenList && Object.keys(filteredTokenList).length === 0 && (
              <TYPE.body>{activeTab === tabsLookup.search ? 'No results' : 'Saved tokens will appear here'}</TYPE.body>
            )}
            {filteredTokenList &&
              filteredTokenList.slice(0, tokensShown).map((item, index) => {
                return (
                  <div key={index}>
                    <TokensListItem key={index} tokenData={allTokenData[item.tokenAddress]} />
                  </div>
                )
              })}

            <Heading hide={!(Object.keys(filteredTokenList).length > 3 && Object.keys(filteredTokenList).length >= tokensShown)}>
              <Blue
                onClick={() => {
                  setTokensShown(tokensShown + 5)
                }}
              >
                See more...
              </Blue>
            </Heading>
          </TableRowsWrapper>
        </TableWrapper>

        <Divider />

        <TableWrapper>
          <DashGrid>
            <Flex alignItems="center" justifyContent="flex-start">
              <TYPE.main area="name" fontSize={'16px'}>
                Pools
              </TYPE.main>
            </Flex>
            {!below768 && (
              <>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="liquidity">Liquidity</TYPE.main>
                </Flex>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="volume">Volume (24H)</TYPE.main>
                </Flex>
                <Flex alignItems="center" justifyContent="flex-end">
                  <TYPE.main area="price">Fee</TYPE.main>
                </Flex>
              </>
            )}
          </DashGrid>
          <TableRowsWrapper gap="20px" flexDirection={'column'}>
            {filteredPairList && Object.keys(filteredPairList).length === 0 && (
              <TYPE.body>
                <TYPE.body>{activeTab === tabsLookup.search ? 'No results' : 'Saved pools will appear here'}</TYPE.body>
              </TYPE.body>
            )}

            {filteredPairList &&
              filteredPairList.slice(0, pairsShown).map((item, index) => {
                return (
                  <div key={index}>
                    <PoolsListItem key={index} pairData={allPairData[item.poolAddress]} />
                  </div>
                )
              })}

            <Heading hide={!(Object.keys(filteredPairList).length > 3 && Object.keys(filteredPairList).length >= pairsShown)}>
              <Blue
                onClick={() => {
                  setPairsShown(pairsShown + 5)
                }}
              >
                See more...
              </Blue>
            </Heading>
          </TableRowsWrapper>
        </TableWrapper>
      </Menu>
    </Container>
  )
}

export default Search
