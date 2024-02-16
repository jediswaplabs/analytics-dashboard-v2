import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { useWhitelistedTokens } from './Application'

import { jediSwapClient } from '../apollo/client'

import { TOP_TOKENS_DATA, HISTORICAL_TOKENS_DATA, TOKEN_PAIRS_DATA, TOKENS_DATA } from '../apollo/queries'

import { get2DayPercentChange, get2DayPercentChangeNew, getPercentChange, isStarknetAddress } from '../utils'
import { apiTimeframeOptions } from '../constants'

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
          return (added[token.tokenAddress] = token)
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
        [TOKEN_PAIRS_KEY]: {
          ...[state[TOKEN_PAIRS_KEY]],
          [address]: allPairs,
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

const getTopTokens = async (whitelistedIds = []) => {
  try {
    // need to get the top tokens by liquidity by need token day datas
    const currentDate = parseInt(Date.now() / 86400 / 1000) * 86400 - 86400
    let tokenIds = await jediSwapClient.query({
      query: TOP_TOKENS_DATA({ tokenIds: whitelistedIds }),
      fetchPolicy: 'network-only',
      variables: { date: currentDate - 1000000 },
    })

    const ids = tokenIds?.data?.tokensDayData?.reduce((accum, { tokenAddress }) => {
      if (!accum.includes(tokenAddress)) {
        accum.push(tokenAddress)
      }
      return accum
    }, [])

    const bulkResults = await getBulkTokenData(ids)
    return bulkResults
    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e)
  }
}

const getBulkTokenData = async (ids) => {
  try {
    let current = await jediSwapClient.query({
      query: TOKENS_DATA({
        tokenIds: ids,
      }),
      fetchPolicy: 'cache-first',
    })

    let historicalData = await jediSwapClient.query({
      query: HISTORICAL_TOKENS_DATA({
        tokenIds: ids,
        periods: [apiTimeframeOptions.oneDay, apiTimeframeOptions.twoDays, apiTimeframeOptions.oneWeek],
      }),
      fetchPolicy: 'cache-first',
    })

    let oneDayData = historicalData?.data?.tokensData.reduce((acc, currentValue, i) => {
      return { ...acc, [currentValue.token.tokenAddress]: currentValue?.period?.[apiTimeframeOptions.oneDay] }
    }, {})

    let twoDaysData = historicalData?.data?.tokensData.reduce((acc, currentValue, i) => {
      return { ...acc, [currentValue.token.tokenAddress]: currentValue?.period?.[apiTimeframeOptions.twoDays] }
    }, {})

    let bulkResults = await Promise.all(
      current &&
      oneDayData &&
      twoDaysData &&
      current?.data?.tokens.map(async (token) => {
        let data = token
        let oneDayHistory = oneDayData?.[token.tokenAddress]
        let twoDaysHistory = twoDaysData?.[token.tokenAddress]

        const oneDayVolumeUSD = oneDayHistory?.volumeUSD || 0
        const twoDayVolumeUSD = twoDaysHistory?.volumeUSD || 0
        const volumeChangeUSD = get2DayPercentChangeNew(oneDayVolumeUSD, twoDayVolumeUSD)

        // const [oneDayTxns, txnChange] = get2DayPercentChange(data.txCount, oneDayHistory?.txCount ?? 0, twoDaysHistory?.txCount ?? 0)
        // const [oneDayFees, feesChange] = get2DayPercentChange(data.feesUSD, oneDayHistory?.feesUSD ?? 0, twoDaysHistory?.feesUSD ?? 0)
        const oneDayFees = oneDayHistory?.feesUSD || 0
        const twoDayFees = twoDaysHistory?.feesUSD || 0
        const feesChange = get2DayPercentChangeNew(oneDayFees, twoDayFees)

        const tvlUSD = data?.totalValueLockedUSD ? parseFloat(data.totalValueLockedUSD) : 0
        const tvlUSDChange = getPercentChange(data?.totalValueLockedUSD, oneDayHistory?.totalValueLockedUSD)
        const tvlToken = data?.totalValueLocked ? parseFloat(data.totalValueLocked) : 0

        const priceUSD = oneDayHistory?.close ? parseFloat(oneDayHistory.close) : 0
        // const priceUSDChange = priceUSDOneDay && priceUSDTwoDays ? getPercentChange(priceUSDOneDay.toString(), priceUSDTwoDays.toString()) : 0
        const priceUSDChange = getPercentChange(oneDayHistory?.close, oneDayHistory?.open)

        const txCount =
          data?.txCount && oneDayHistory?.txCount
            ? parseFloat(data.txCount) - parseFloat(oneDayHistory.txCount)
            : data
              ? parseFloat(data.txCount)
              : 0
        const feesUSD =
          data?.feesUSD && oneDayHistory?.feesUSD
            ? parseFloat(data.feesUSD) - parseFloat(oneDayHistory.feesUSD)
            : data
              ? parseFloat(data.feesUSD)
              : 0

        data.priceUSD = priceUSD
        data.priceChangeUSD = priceUSDChange

        data.totalLiquidityUSD = tvlUSD
        data.liquidityChangeUSD = tvlUSDChange
        // data.liquidityToken = tvlToken

        data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
        data.volumeChangeUSD = volumeChangeUSD
        // data.oneDayVolumeETH = parseFloat(oneDayVolumeETH)
        // data.volumeChangeETH = volumeChangeETH

        // data.oneDayTxns = oneDayTxns
        // data.txnChange = txnChange

        data.feesUSD = feesUSD
        data.oneDayFees = oneDayFees
        data.feesChangeUSD = feesChange

        // used for custom adjustments
        data.oneDayData = oneDayHistory
        data.twoDaysData = twoDaysHistory

        return data
      })
    )
    return bulkResults
  } catch (e) {
    console.log(e)
  }
}

const getTokenPairs = async (address, whitelistedTokenIds = []) => {
  try {
    // fetch all current and historical data
    let result = await jediSwapClient.query({
      query: TOKEN_PAIRS_DATA({
        tokenId: address,
        whitelistedTokenIds: whitelistedTokenIds,
      }),
      fetchPolicy: 'cache-first',
    })
    return result.data?.pairs ?? []
  } catch (e) {
    console.log(e)
  }
}

export function Updater() {
  const [, { updateTopTokens }] = useTokenDataContext()
  const whitelistedTokensRaw = useWhitelistedTokens() ?? {}
  const whitelistedTokens = useMemo(() => whitelistedTokensRaw, [Object.keys(whitelistedTokensRaw).join(',')])

  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      let topTokens = await getTopTokens(Object.keys(whitelistedTokens))
      topTokens && updateTopTokens(topTokens)
    }
    getData()
  }, [updateTopTokens, whitelistedTokens])
  return null
}

export function useTokenData(tokenAddress) {
  const [state, { update }] = useTokenDataContext()
  const tokenData = state?.[tokenAddress]

  useEffect(() => {
    if (!tokenData && isStarknetAddress(tokenAddress)) {
      getBulkTokenData([tokenAddress]).then((data) => {
        update(tokenAddress, data[0])
      })
    }
  }, [tokenAddress, tokenData, update])

  return tokenData || {}
}

export function useTokenDataForList(addresses) {
  const [state, { update }] = useTokenDataContext()
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
      let data = await getBulkTokenData(untrackedAddresses)
      data &&
        data.forEach((p) => {
          update(p.id, p)
        })
    }
    if (untrackedAddresses.length) {
      fetchData()
    }
  }, [untrackedAddresses, update])
  return tokensWithData
}

export function useTokenPairs(tokenAddress) {
  const [state, { updateAllPairs }] = useTokenDataContext()
  const tokenPairs = state?.[TOKEN_PAIRS_KEY]?.[tokenAddress]
  const whitelistedTokensRaw = useWhitelistedTokens() ?? {}
  const whitelistedTokens = useMemo(() => whitelistedTokensRaw, [Object.keys(whitelistedTokensRaw).join(',')])

  useEffect(() => {
    async function fetchData() {
      let allPairs = await getTokenPairs(tokenAddress, Object.keys(whitelistedTokens))
      updateAllPairs(tokenAddress, allPairs)
    }
    if (!tokenPairs && isStarknetAddress(tokenAddress)) {
      fetchData()
    }
  }, [tokenAddress, tokenPairs, updateAllPairs, whitelistedTokens])

  return tokenPairs || []
}

export function useAllTokenData() {
  const [state] = useTokenDataContext()

  // filter out for only addresses
  return Object.keys(state)
    .filter((key) => key !== 'combinedVol')
    .filter((key) => key !== TOKEN_PAIRS_KEY)
    .reduce((res, key) => {
      res[key] = state[key]
      return res
    }, {})
}
