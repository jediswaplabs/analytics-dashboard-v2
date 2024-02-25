import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { jediSwapClient } from '../apollo/client'
import { HISTORICAL_POOLS_DATA } from '../apollo/queries'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { getPercentChange, get2DayPercentChange, isAddress, isStarknetAddress } from '../utils'
import { apiTimeframeOptions } from '../constants'
import { useWhitelistedTokens } from './Application'

const UPDATE = 'UPDATE'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'

dayjs.extend(utc)

const PairDataContext = createContext()

function usePairDataContext() {
  return useContext(PairDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data } = payload
      return {
        ...state,
        [pairAddress]: {
          ...state?.[pairAddress],
          ...data,
        },
      }
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs } = payload
      let added = {}
      topPairs.map((pair) => {
        return (added[pair.poolAddress] = pair)
      })
      return {
        ...state,
        ...added,
      }
    }

    case UPDATE_HOURLY_DATA: {
      const { address, hourlyData, timeWindow } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          hourlyData: {
            ...state?.[address]?.hourlyData,
            [timeWindow]: hourlyData,
          },
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

  // update pair specific data
  const update = useCallback((pairAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        data,
      },
    })
  }, [])

  const updateTopPairs = useCallback((topPairs) => {
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs,
      },
    })
  }, [])

  const updateHourlyData = useCallback((address, hourlyData, timeWindow) => {
    dispatch({
      type: UPDATE_HOURLY_DATA,
      payload: { address, hourlyData, timeWindow },
    })
  }, [])

  return (
    <PairDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateTopPairs,
            updateHourlyData,
          },
        ],
        [state, update, updateTopPairs, updateHourlyData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(tokenList) {
  try {
    let historicalData = await jediSwapClient.query({
      query: HISTORICAL_POOLS_DATA({
        tokenIds: tokenList,
        periods: [apiTimeframeOptions.oneDay, apiTimeframeOptions.twoDays, apiTimeframeOptions.oneWeek],
      }),
      fetchPolicy: 'cache-first',
    })
    let oneDayData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.oneDay] }
    }, {})

    let twoDayData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.twoDays] }
    }, {})

    let oneWeekData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.period?.[apiTimeframeOptions.oneWeek] }
    }, {})
    let currentData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.pool.poolAddress]: cur?.pool }
    }, {})


    const poolList = Object.keys(currentData)

    let pairData =
      poolList.map((poolAddress) => {
        let pair = currentData[poolAddress]
        let oneDayHistory = oneDayData?.[pair.poolAddress]
        let twoDayHistory = twoDayData?.[pair.poolAddress]
        let oneWeekHistory = oneWeekData?.[pair.poolAddress]
        const data = parseData(pair, oneDayHistory, twoDayHistory, oneWeekHistory)
        return data
      })

    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData) {
  const oneDayVolumeUSD = oneDayData?.volumeUSD || 0
  const twoDayVolumeUSD = twoDayData?.volumeUSD || 0
  const volumeChangeUSD = get2DayPercentChange(oneDayVolumeUSD, twoDayVolumeUSD)

  const oneDayFeesUSD = oneDayData?.feesUSD || 0
  const twoDayFeesUSD = twoDayData?.feesUSD || 0
  const feesChangeUSD = get2DayPercentChange(oneDayFeesUSD, twoDayFeesUSD)

  const oneWeekVolumeUSD = oneWeekData?.volumeUSD || 0

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD

  data.oneDayFeesUSD = parseFloat(oneDayFeesUSD);
  data.feesChangeUSD = feesChangeUSD;

  // set liquidity properties
  data.trackedReserveUSD = data.totalValueLockedUSD
  data.liquidityChangeUSD = getPercentChange(oneDayData.totalValueLockedUSD, oneDayData.totalValueLockedUSDFirst)

  // if (!oneDayData && data) {
  //   data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  // }
  // if (!oneWeekData && data) {
  //   data.oneWeekVolumeUSD = parseFloat(data.volumeUSD)
  // }

  return data
}

const getAllPools = async (whitelistedIds = []) => {
  try {
    const bulkResults = getBulkPairData(whitelistedIds)
    return bulkResults
  } catch (e) {
    console.log(e)
  }
}

export function Updater() {
  const [, { updateTopPairs }] = usePairDataContext()
  const whitelistedTokensRaw = useWhitelistedTokens() ?? {}
  const whitelistedTokens = useMemo(() => whitelistedTokensRaw, [Object.keys(whitelistedTokensRaw).join(',')])
  useEffect(() => {
    async function getData() {
      // get top pairs for overview list
      if (Object.keys(whitelistedTokens).length === 0) {
        return
      }
      let topPairs = await getAllPools(Object.keys(whitelistedTokens))
      topPairs && updateTopPairs(topPairs)
    }
    getData()
  }, [updateTopPairs, whitelistedTokens])
  return null
}

export function usePairDataForToken(tokenAddress) {
  const allPoolData = useAllPairData()
  const tokenPools = {};
  Object.values(allPoolData).forEach(pool => {
    if (pool.token0.tokenAddress === tokenAddress || pool.token1.tokenAddress === tokenAddress) {
      tokenPools[pool.poolAddress] = pool
    }
  })
  return tokenPools
}

export function usePairDataForList(poolAddresses) {
  const allPoolData = useAllPairData()
  const pools = {};
  Object.keys(allPoolData).forEach(key => {
    if (poolAddresses.includes(key)) {
      pools[key] = allPoolData[key]
    }
  })
  return pools
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const allPairsData = useAllPairData()
  const pairData = allPairsData?.[pairAddress]
  return pairData || {}
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  return state || {}
}
