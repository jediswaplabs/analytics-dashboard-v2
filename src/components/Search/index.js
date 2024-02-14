import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import styled from 'styled-components'

import Row, { AutoRow, RowFixed } from '../Row'
import TokenLogo from '../TokenLogo'
import { Search as SearchIcon, X } from 'react-feather'
import { BasicLink, CustomLink } from '../Link'

import { useAllTokenData, useTokenData } from '../../contexts/TokenData'
import { useAllPairData, usePairData } from '../../contexts/PairData'
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
  width: 100%;
  max-height: 540px;
  z-index: 9999;
  overflow: auto;
  padding: 32px;
  //padding-bottom: 20px;
  background: ${({ theme }) => theme.bg7};
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.04);
  display: ${({ hide }) => hide && 'none'};
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
  padding: 1rem;
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

const TableWrapper = styled.div``

const DashGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  grid-template-areas: 'name liquidity volume price';

  // display: grid;
  // grid-gap: 1em;
  // grid-template-columns: 100px 1fr 1fr;
  // grid-template-areas: 'name liq vol';
  // padding: 0 1.125rem;
  // //
  // // opacity: ${({ fade }) => (fade ? '0.6' : '1')};
  // //
  // // > * {
  // //   justify-content: flex-end;
  // //
  // //   :first-child {
  // //     justify-content: flex-start;
  // //     text-align: left;
  // //     width: 20px;
  // //   }
  // // }
  // //
  // // @media screen and (min-width: 740px) {
  // //   padding: 0 1.125rem;
  // //   grid-template-columns: 1.7fr 1fr 1fr};
  // //   grid-template-areas: ' name liq vol pool ';
  // // }
  // //
  // // @media screen and (min-width: 1080px) {
  // //   padding: 0 1.125rem;
  // //   grid-template-columns: 1.7fr 1fr 1fr 1fr 1fr 1fr;
  // //   grid-template-areas: ' name liq vol volWeek fees apy';
  // // }
  // //
  // // @media screen and (min-width: 1200px) {
  // //   grid-template-columns: 1.7fr 1fr 1fr 1fr 1fr 1fr;
  // //   grid-template-areas: ' name liq vol volWeek fees apy';
  // // }
`

export const Search = ({ small = false }) => {
  let allTokens = useAllTokensInJediswap()
  const allTokenData = useAllTokenData()

  let allPairs = useAllPairsInJediswap()
  const allPairData = useAllPairData()

  const [showMenu, toggleMenu] = useState(false)
  const [value, setValue] = useState('')
  const [, toggleShadow] = useState(false)
  const [, toggleBottomShadow] = useState(false)

  // fetch new data on tokens and pairs if needed
  // useTokenData(value)
  // usePairData(value)
  const whitelistedTokens = useWhitelistedTokens()

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

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       if (value?.length > 0) {
  //         let tokens = await jediSwapClient.query({
  //           query: TOKEN_SEARCH,
  //           variables: {
  //             value: value ? value.toUpperCase() : '',
  //             id: value,
  //           },
  //         })
  //
  //         let pairs = await jediSwapClient.query({
  //           query: PAIR_SEARCH,
  //           variables: {
  //             tokens: tokens.data.asSymbol?.map((t) => t.tokenAddress),
  //             id: value,
  //           },
  //         })
  //
  //         setSearchedPairs(updateNameData(pairs.data.as0).concat(updateNameData(pairs.data.as1)).concat(updateNameData(pairs.data.asAddress)))
  //         const foundTokens = tokens.data.asSymbol.concat(tokens.data.asAddress).concat(tokens.data.asName)
  //         setSearchedTokens(foundTokens)
  //       }
  //     } catch (e) {
  //       console.log(e)
  //     }
  //   }
  //   fetchData()
  // }, [value])

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
    return uniqueTokens
      ? uniqueTokens
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
    return uniquePairs
      ? uniquePairs
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
  }, [allPairData, uniquePairs, value, whitelistedTokens])

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
  })

  useEffect(() => {
    if (showMenu && wrapperRef.current) {
      wrapperRef.current.focus()
    }
  }, [showMenu])

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
      <Menu hide={showMenu} ref={menuRef}>
        <TableWrapper>
          <DashGrid>
            <Flex alignItems="center" justifyContent="flex-start">
              <TYPE.main area="name" fontSize={'16px'}>
                All tokens
              </TYPE.main>
            </Flex>
            <Flex alignItems="center" justifyContent="flex-start">
              <TYPE.main area="liquidity">Liquidity</TYPE.main>
            </Flex>
            <Flex alignItems="center" justifyContent="flex-start">
              <TYPE.main area="volume">Volume (24H)</TYPE.main>
            </Flex>
            <Flex alignItems="center" justifyContent="flex-end">
              <TYPE.main area="price">Price</TYPE.main>
            </Flex>
          </DashGrid>
        </TableWrapper>

        <Heading>
          <Gray>Pairs</Gray>
        </Heading>
        <div>
          {filteredPairList && Object.keys(filteredPairList).length === 0 && (
            <MenuItem>
              <TYPE.body>No results</TYPE.body>
            </MenuItem>
          )}
          {filteredPairList &&
            filteredPairList.slice(0, pairsShown).map((pair) => {
              const feePercent = (pair.fee ? parseFloat(pair.fee) / 10000 : 0) + '%'

              return (
                <BasicLink to={'/pool/' + pair.poolAddress} key={pair.poolAddress} onClick={onDismiss}>
                  <MenuItem>
                    <DoubleTokenLogo a0={pair?.token0?.tokenAddress} a1={pair?.token1?.tokenAddress} margin={true} />
                    <AutoRow gap={'4px'} style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
                      <TYPE.body>{pair.token0.symbol + '-' + pair.token1.symbol} Pair</TYPE.body>
                      <FeeBadge>{feePercent}</FeeBadge>
                    </AutoRow>
                  </MenuItem>
                </BasicLink>
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
        </div>
        <Heading>
          <Gray>Tokens</Gray>
        </Heading>
        <div>
          {Object.keys(filteredTokenList).length === 0 && (
            <MenuItem>
              <TYPE.body>No results</TYPE.body>
            </MenuItem>
          )}
          {filteredTokenList.slice(0, tokensShown).map((token) => {
            // update displayed names
            updateNameData({ token0: token })
            return (
              <BasicLink to={'/token/' + token.tokenAddress} key={token.tokenAddress} onClick={onDismiss}>
                <MenuItem>
                  <RowFixed>
                    <TokenLogo address={token.tokenAddress} style={{ marginRight: '10px' }} />
                    <FormattedName text={token.name} maxCharacters={20} style={{ marginRight: '6px' }} />
                    (<FormattedName text={token.symbol} maxCharacters={6} />)
                  </RowFixed>
                </MenuItem>
              </BasicLink>
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
        </div>
      </Menu>
    </Container>
  )
}

export default Search
