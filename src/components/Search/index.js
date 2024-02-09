import React, { useState, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import Row, { RowFixed } from '../Row'
import TokenLogo from '../TokenLogo'
import { Search as SearchIcon, X } from 'react-feather'
import { BasicLink } from '../Link'

import { useAllTokenData, useTokenData } from '../../contexts/TokenData'
import { useAllPairData, usePairData } from '../../contexts/PairData'
import DoubleTokenLogo from '../DoubleLogo'
import { useMedia } from 'react-use'
import { useAllPairsInJediswap, useAllTokensInJediswap } from '../../contexts/GlobalData'

import { transparentize } from 'polished'
import { jediSwapClient } from '../../apollo/client'
import { PAIR_SEARCH, TOKEN_SEARCH } from '../../apollo/queries'
import FormattedName from '../FormattedName'
import { TYPE } from '../../Theme'
import { updateNameData } from '../../utils/data'
import { useWhitelistedTokens } from '../../contexts/Application'
import CMDIcon from '../../assets/cmd.png'
import Tabs from '../Tabs'
import Column from '../Column'
import { formattedNum } from '../../utils'
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
  padding: 12px 16px;
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
  color: ${({ theme }) => theme.text1};
  font-size: ${({ large }) => (large ? '20px' : '14px')};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
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
  margin-right: 0.5rem;
  pointer-events: none;
  color: ${({ theme }) => theme.text3};
`

const CloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  margin-right: 0.5rem;
  position: absolute;
  right: 10px;
  color: ${({ theme }) => theme.text3};
  :hover {
    cursor: pointer;
  }
`

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 9999;
  width: 100%;
  top: 50px;
  max-height: 540px;
  overflow: auto;
  left: 0;
  padding-bottom: 20px;
  background: ${({ theme }) => theme.bg7};
  border-radius: 8px;
  border: 2px solid #7e3ee4;
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

const List = styled.div`
  padding-left: 1rem;
`
const Divider = styled.div`
  width: 962px;
  height: 1px;
  flex-shrink: 0;
  margin: 0px 32px;
  background: rgba(217, 217, 217, 0.2);
`

const Heading = styled(Row)`
  padding: 1rem 2rem;
  display: ${({ hide = false }) => hide && 'none'};
`

const HeadingText = styled(Column)`
  color: rgba(242, 242, 242, 0.8);
  font-family: 'DM Sans';
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 125% */
  flex: 1;
`
const ColumnHeading = styled(Column)`
  color: rgba(255, 255, 255, 0.8);
  font-family: 'DM Sans';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 14px */
  flex: 1;
  text-align: end;
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
const TokenName = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`

const DataText = styled(Flex)`
  align-items: center;
  flex: 1;
  justify-content: end;
  color: ${({ theme }) => theme.text1} !important;

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
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
  const tokenData = useTokenData(value)
  useTokenData(value)
  usePairData(value)
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

  useEffect(() => {
    async function fetchData() {
      try {
        if (value?.length > 0) {
          let tokens = await jediSwapClient.query({
            query: TOKEN_SEARCH,
            variables: {
              value: value ? value.toUpperCase() : '',
              id: value,
            },
          })

          let pairs = await jediSwapClient.query({
            query: PAIR_SEARCH,
            variables: {
              tokens: tokens.data.asSymbol?.map((t) => t.id),
              id: value,
            },
          })

          setSearchedPairs(updateNameData(pairs.data.as0).concat(updateNameData(pairs.data.as1)).concat(updateNameData(pairs.data.asAddress)))
          const foundTokens = tokens.data.asSymbol.concat(tokens.data.asAddress).concat(tokens.data.asName)
          setSearchedTokens(foundTokens)
        }
      } catch (e) {
        console.log(e)
      }
    }
    fetchData()
  }, [value])

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  // add the searched tokens to the list if not found yet
  allTokens = allTokens.concat(
    searchedTokens.filter((searchedToken) => {
      let included = false
      updateNameData()
      allTokens.map((token) => {
        if (token.id === searchedToken.id) {
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
      if (!found[token.id]) {
        found[token.id] = true
        uniqueTokens.push(token)
      }
      return true
    })

  allPairs = allPairs.concat(
    searchedPairs.filter((searchedPair) => {
      let included = false
      allPairs.map((pair) => {
        if (pair.id === searchedPair.id) {
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
      if (!pairsFound[pair.id]) {
        pairsFound[pair.id] = true
        uniquePairs.push(pair)
      }
      return true
    })

  const filteredTokenList = useMemo(() => {
    return uniqueTokens
      ? uniqueTokens
          .sort((a, b) => {
            const tokenA = allTokenData[a.id]
            const tokenB = allTokenData[b.id]
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
            if (!whitelistedTokens[token.id]) {
              return false
            }
            const regexMatches = Object.keys(token).map((tokenEntryKey) => {
              const isAddress = value.slice(0, 2) === '0x'
              if (tokenEntryKey === 'id' && isAddress) {
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
            const pairA = allPairData[a.id]
            const pairB = allPairData[b.id]
            if (pairA?.trackedReserveETH && pairB?.trackedReserveETH) {
              return parseFloat(pairA.trackedReserveETH) > parseFloat(pairB.trackedReserveETH) ? -1 : 1
            }
            if (pairA?.trackedReserveETH && !pairB?.trackedReserveETH) {
              return -1
            }
            if (!pairA?.trackedReserveETH && pairB?.trackedReserveETH) {
              return 1
            }
            return 0
          })
          .filter((pair) => {
            if (!(whitelistedTokens[pair.token0.id] && whitelistedTokens[pair.token1.id])) {
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
              if (field === 'id' && isAddress) {
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

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })

  const SearchMenuItemContent = () => (
    <>
      <Heading>
        <HeadingText>All Tokens</HeadingText>
        <ColumnHeading>Liquidity</ColumnHeading>
        <ColumnHeading>Voulme(24H)</ColumnHeading>
        <ColumnHeading>Price</ColumnHeading>
      </Heading>
      <List>
        {Object.keys(filteredTokenList).length === 0 && (
          <MenuItem>
            <TYPE.body>No results</TYPE.body>
          </MenuItem>
        )}
        {filteredTokenList.slice(0, tokensShown).map((token) => {
          // update displayed names
          updateNameData({ token0: token })
          return (
            <BasicLink to={'/token/' + token.id} key={token.id} onClick={onDismiss}>
              <MenuItem>
                <Row>
                  <TokenName>
                    <TokenLogo address={token.id} style={{ marginRight: '10px' }} />
                    <FormattedName text={token.name} maxCharacters={20} style={{ marginRight: '6px' }} />
                    <FormattedName text={`(${token.symbol})`} maxCharacters={6} />
                  </TokenName>
                  <DataText area="liq">{formattedNum(123, true)}</DataText>
                  <DataText area="vol">{formattedNum(123, true)}</DataText>
                  <DataText area="price" color="text" fontWeight="500">
                    {formattedNum(123, true)}
                  </DataText>
                </Row>
              </MenuItem>
            </BasicLink>
          )
        })}

        <Heading
          hide={!(Object.keys(filteredTokenList).length > 3 && Object.keys(filteredTokenList).length >= tokensShown)}
          style={{ paddingLeft: '16px' }}
        >
          <Blue
            onClick={() => {
              setTokensShown(tokensShown + 5)
            }}
          >
            See more...
          </Blue>
        </Heading>
      </List>
      <Divider></Divider>
      <Heading>
        <HeadingText>Pools</HeadingText>
        <ColumnHeading>Liquidity</ColumnHeading>
        <ColumnHeading>Voulme(24H)</ColumnHeading>
        <ColumnHeading>Price</ColumnHeading>
      </Heading>
      <List>
        {filteredPairList && Object.keys(filteredPairList).length === 0 && (
          <MenuItem>
            <TYPE.body>No results</TYPE.body>
          </MenuItem>
        )}
        {filteredPairList &&
          filteredPairList.slice(0, pairsShown).map((pair) => {
            //format incorrect names
            updateNameData(pair)
            return (
              <BasicLink to={'/pair/' + pair.id} key={pair.id} onClick={onDismiss}>
                <MenuItem>
                  <Row>
                    <TokenName>
                      <DoubleTokenLogo a0={pair?.token0?.id} a1={pair?.token1?.id} margin={true} />
                      <TYPE.body style={{ marginLeft: '10px' }}>{pair.token0.symbol + '-' + pair.token1.symbol}</TYPE.body>
                    </TokenName>
                    <DataText area="liq">{formattedNum(123, true)}</DataText>
                    <DataText area="vol">{formattedNum(123, true)}</DataText>
                    <DataText area="price" color="text" fontWeight="500">
                      {formattedNum(123, true)}
                    </DataText>
                  </Row>
                </MenuItem>
              </BasicLink>
            )
          })}
        <Heading
          hide={!(Object.keys(filteredPairList).length > 3 && Object.keys(filteredPairList).length >= pairsShown)}
          style={{ paddingLeft: '16px' }}
        >
          <Blue
            onClick={() => {
              setPairsShown(pairsShown + 5)
            }}
          >
            See more...
          </Blue>
        </Heading>
      </List>
    </>
  )

  const tabs = [
    {
      key: 'search',
      label: 'Search',
      content: <SearchMenuItemContent />,
    },
    {
      key: 'watchlist',
      label: 'Watchlist',
      content: '',
    },
  ]

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
              ? 'Search for...'
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
        <img src={CMDIcon}></img>
      </Wrapper>
      <Menu hide={!showMenu} ref={menuRef}>
        <Tabs tabs={tabs}></Tabs>
      </Menu>
    </Container>
  )
}

export default Search
