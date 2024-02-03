import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import { useWhitelistedTokens } from './Application'

import { jediSwapClient } from '../apollo/client'
import { TOKEN_DATA, TOKENS_HISTORICAL_BULK } from '../apollo/queries'

import { jediSwapClientV1 } from '../apollo/v1/client'
import { TOKENS_DAY_DATA } from '../apollo/v1/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  isStarknetAddress,
  convertDateToUnixFormat,
  getTimestampsForChanges,
} from '../utils'
import { timeframeOptions } from '../constants'
import { useLatestBlocks } from './Application'
import { updateNameData } from '../utils/data'

const UPDATE = 'UPDATE'
const UPDATE_TOP_TOKENS = ' UPDATE_TOP_TOKENS'
const UPDATE_ALL_PAIRS = 'UPDATE_ALL_PAIRS'

const TOKEN_PAIRS_KEY = 'TOKEN_PAIRS_KEY'

dayjs.extend(utc)

const TokenDataContext = createContext()

export function useTokenDataContext() {
  return useContext(TokenDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { tokenAddress, data } = payload
      return {
        ...state,
        [tokenAddress]: {
          ...state?.[tokenAddress],
          ...data,
        },
      }
    }
    case UPDATE_TOP_TOKENS: {
      const { topTokens } = payload
      let added = {}
      topTokens &&
        topTokens.map((token) => {
          return (added[token.id] = token)
        })
      return {
        ...state,
        ...added,
      }
    }

    case UPDATE_ALL_PAIRS: {
      const { address, allPairs } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          [TOKEN_PAIRS_KEY]: allPairs,
        },
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((tokenAddress, data) => {
    if (!tokenAddress) {
      return
    }
    dispatch({
      type: UPDATE,
      payload: {
        tokenAddress,
        data,
      },
    })
  }, [])

  const updateTopTokens = useCallback((topTokens) => {
    dispatch({
      type: UPDATE_TOP_TOKENS,
      payload: {
        topTokens,
      },
    })
  }, [])

  const updateAllPairs = useCallback((address, allPairs) => {
    dispatch({
      type: UPDATE_ALL_PAIRS,
      payload: { address, allPairs },
    })
  }, [])

  return (
    <TokenDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTopTokens,
            updateAllPairs,
          },
        ],
        [state, update, updateTopTokens, updateAllPairs]
      )}
    >
      {children}
    </TokenDataContext.Provider>
  )
}

const getTopTokens = async (ethPrice, ethPriceOld, whitelistedIds = []) => {
  try {
    // need to get the top tokens by liquidity by need token day datas
    const currentDate = parseInt(Date.now() / 86400 / 1000) * 86400 - 86400

    let tokenids = await jediSwapClientV1.query({
      query: TOKENS_DAY_DATA(whitelistedIds),
      fetchPolicy: 'network-only',
      variables: { date: currentDate - 1000000 },
    })

    const ids = tokenids?.data?.tokensDayData?.reduce((accum, { tokenAddress }) => {
      if (!accum.includes(tokenAddress)) {
        accum.push(tokenAddress)
      }
      return accum
    }, [])

    const bulkResults = getBulkTokenData(ids, ethPrice, ethPriceOld)
    return bulkResults
    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

const getBulkTokenData = async (ids, ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  try {
    let current = await jediSwapClient.query({
      query: TOKENS_HISTORICAL_BULK(ids),
      fetchPolicy: 'cache-first',
    })
    let oneDayResult = await jediSwapClient.query({
      query: TOKENS_HISTORICAL_BULK(ids, oneDayBlock),
      fetchPolicy: 'cache-first',
    })

    let twoDayResult = await jediSwapClient.query({
      query: TOKENS_HISTORICAL_BULK(ids, twoDayBlock),
      fetchPolicy: 'cache-first',
    })

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token) => {
          let data = token

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id]
          let twoDayHistory = twoDayData?.[token.id]

          // catch the case where token wasn't in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await jediSwapClient.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: 'cache-first',
            })
            oneDayHistory = oneDayResult.data.tokens[0]
          }
          if (!twoDayHistory) {
            let twoDayResult = await jediSwapClient.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: 'cache-first',
            })
            twoDayHistory = twoDayResult.data.tokens[0]
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0
          )
          const [oneDayTxns, txnChange] = get2DayPercentChange(data.txCount, oneDayHistory?.txCount ?? 0, twoDayHistory?.txCount ?? 0)

          const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * ethPriceOld * oneDayHistory?.derivedETH

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0
          )
          // set data
          data.priceUSD = data?.derivedETH * ethPrice
          data.totalLiquidityUSD = currentLiquidityUSD
          data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
          data.volumeChangeUSD = volumeChangeUSD
          data.priceChangeUSD = priceChangeUSD
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
          data.oneDayTxns = oneDayTxns
          data.txnChange = txnChange

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
            data.oneDayTxns = data.txCount
          }

          // update name data for
          updateNameData({
            token0: data,
          })

          // used for custom adjustments
          data.oneDayData = oneDayHistory
          data.twoDayData = twoDayHistory

          return data
        })
    )

    return bulkResults

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

const getTokenPairs = async (tokenAddress) => {
  try {
    // fetch all current and historical data
    let result = await jediSwapClient.query({
      query: TOKEN_DATA(tokenAddress),
      fetchPolicy: 'cache-first',
    })
    return result.data?.['pairs0'].concat(result.data?.['pairs1'])
  } catch (e) {
    console.log(e)
  }
}

export function Updater() {
  const [, { updateTopTokens }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const whitelistedTokens = useWhitelistedTokens() ?? {}
  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(ethPrice, ethPriceOld, Object.keys(whitelistedTokens))
      topTokens && updateTopTokens(topTokens)
    }
    ethPrice && ethPriceOld && getData()
  }, [ethPrice, ethPriceOld, updateTopTokens])
  return null
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const [ethPrice, ethPriceOld] = useEthPrice()
  const tokenData = state?.[tokenAddress]

  useEffect(() => {
    if (!tokenData && ethPrice && ethPriceOld && isStarknetAddress(tokenAddress)) {
      getBulkTokenData([tokenAddress], ethPrice, ethPriceOld).then((data) => {
        update(tokenAddress, data)
      })
    }
  }, [ethPrice, ethPriceOld, tokenAddress, tokenData, update])

  return tokenData || {}
}

export function useTokenDataForList(addresses) {
  const [state, { update }] = useTokenDataContext()
  const [ethPrice] = useEthPrice()
  const allTokensData = useAllTokenData()

  const untrackedAddresses = addresses.reduce((accum, address) => {
    if (!Object.keys(allTokensData).includes(address) && isStarknetAddress(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  // filter for pools with data
  const tokensWithData = addresses
    .map((address) => {
      const tokenData = allTokensData[address]
      return tokenData ?? undefined
    })
    .filter((v) => !!v)

  useEffect(() => {
    async function fetchData() {
      if (!untrackedAddresses.length) {
        return
      }
      let data = await getBulkTokenData(untrackedAddresses, ethPrice)
      data &&
        data.forEach((p) => {
          update(p.id, p)
        })
    }
    if (untrackedAddresses.length) {
      fetchData()
    }
  }, [untrackedAddresses, ethPrice, update])
  return tokensWithData
}

export function useTokenPairs(tokenAddress) {
  const [state, { updateAllPairs }] = useTokenDataContext()
  const tokenPairs = state?.[tokenAddress]?.[TOKEN_PAIRS_KEY]

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(tokenAddress)
      updateAllPairs(tokenAddress, allPairs)
    }
    if (!tokenPairs && isStarknetAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, updateAllPairs])

  return tokenPairs || []
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()

  // filter out for only addresses
  return Object.keys(state)
    .filter((key) => key !== 'combinedVol')
    .reduce((res, key) => {
      res[key] = state[key]
      return res
    }, {})
}
