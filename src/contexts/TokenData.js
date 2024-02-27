import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { useWhitelistedTokens } from './Application'

import { jediSwapClient } from '../apollo/client'

import { HISTORICAL_TOKENS_DATA } from '../apollo/queries'

import { get2DayPercentChange, getPercentChange, isStarknetAddress } from '../utils'
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

const getAllTokens = async (whitelistedIds = []) => {
  try {
    const bulkResults = await getBulkTokenData(whitelistedIds)
    return bulkResults
  } catch (e) {
    console.log(e)
  }
}

const getBulkTokenData = async (ids) => {
  try {
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
    let currentData = historicalData?.data?.tokensData.reduce((acc, currentValue, i) => {
      return { ...acc, [currentValue.token.tokenAddress]: currentValue?.token }
    }, {})

    const tokenList = Object.keys(currentData)

    let bulkResults = await Promise.all(
      tokenList &&
      oneDayData &&
      twoDaysData &&
      tokenList.map(async (tokenAddress) => {
        let data = currentData[tokenAddress]
        // let data = token
        let oneDayHistory = oneDayData?.[tokenAddress]
        let twoDaysHistory = twoDaysData?.[tokenAddress]

        const oneDayVolumeUSD = oneDayHistory?.volumeUSD || 0
        const twoDayVolumeUSD = twoDaysHistory?.volumeUSD || 0
        const volumeChangeUSD = get2DayPercentChange(oneDayVolumeUSD, twoDayVolumeUSD)

        // const [oneDayFees, feesChange] = get2DayPercentChange(data.feesUSD, oneDayHistory?.feesUSD ?? 0, twoDaysHistory?.feesUSD ?? 0)
        const oneDayFees = oneDayHistory?.feesUSD || 0
        const twoDayFees = twoDaysHistory?.feesUSD || 0
        const feesChange = get2DayPercentChange(oneDayFees, twoDayFees)

        const tvlUSD = oneDayHistory.totalValueLockedUSD || 0
        const tvlUSDChange = getPercentChange(oneDayHistory.totalValueLockedUSD, oneDayHistory.totalValueLockedUSDFirst)
        const tvlToken = data?.totalValueLocked ? parseFloat(data.totalValueLocked) : 0

        const priceUSD = oneDayHistory?.close ? parseFloat(oneDayHistory.close) : 0
        // const priceUSDChange = priceUSDOneDay && priceUSDTwoDays ? getPercentChange(priceUSDOneDay.toString(), priceUSDTwoDays.toString()) : 0
        const priceUSDChange = getPercentChange(oneDayHistory?.close, oneDayHistory?.open)

        const feesUSD =
          data?.feesUSD && oneDayHistory?.feesUSD
            ? parseFloat(data.feesUSD) - parseFloat(oneDayHistory.feesUSD)
            : data
              ? parseFloat(data.feesUSD)
              : 0

        data.priceUSD = priceUSD
        data.priceChangeUSD = priceUSDChange

        data.totalLiquidityUSD = data.totalValueLockedUSD
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

export function Updater() {
  const [, { updateTopTokens }] = useTokenDataContext()
  const whitelistedTokensRaw = useWhitelistedTokens() ?? {}
  const whitelistedTokens = useMemo(() => whitelistedTokensRaw, [Object.keys(whitelistedTokensRaw).join(',')])

  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      if (Object.keys(whitelistedTokens).length === 0) {
        return
      }
      let topTokens = await getAllTokens(Object.keys(whitelistedTokens))
      topTokens && updateTopTokens(topTokens)
    }
    getData()
  }, [updateTopTokens, whitelistedTokens])
  return null
}

export function useTokenData(tokenAddress) {
  const [state] = useTokenDataContext()
  const tokenData = state?.[tokenAddress]

  return tokenData || {}
}

export function useTokenDataForList(addresses) {
  const allTokensData = useAllTokenData()
  const tokens = {};
  Object.keys(allTokensData).forEach(key => {
    if (addresses.includes(key)) {
      tokens[key] = allTokensData[key]
    }
  })
  return tokens
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
