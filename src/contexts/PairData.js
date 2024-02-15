import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { jediSwapClient } from '../apollo/client'
import { POOLS_DATA, HISTORICAL_POOLS_DATA, TOP_POOLS_DATA } from '../apollo/queries'

// import { TOP_TOKENS_DATA, HISTORICAL_TOKENS_DATA, TOKEN_PAIRS_DATA, TOKENS_DATA } from '../apollo/queries'
// import { PAIR_CHART, FILTERED_TRANSACTIONS } from '../apollo/queries'
// import { PAIRS_CURRENT, PAIRS_BULK, PAIR_DATA, PAIRS_HISTORICAL_BULK } from '../apollo/queries'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { getPercentChange, get2DayPercentChange, isAddress, isStarknetAddress } from '../utils'
import { apiTimeframeOptions } from '../constants'
import { useWhitelistedTokens } from './Application'

const UPDATE = 'UPDATE'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce((accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null), object)
    : null
}

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

async function getBulkPairData(pairList) {
  try {
    let current = await jediSwapClient.query({
      query: POOLS_DATA({ poolIds: pairList }),
      fetchPolicy: 'cache-first',
    })

    let historicalData = await jediSwapClient.query({
      query: HISTORICAL_POOLS_DATA({
        poolIds: pairList,
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

    let pairData = await Promise.all(
      current &&
      current.data.pools.map(async (pair) => {
        let data = pair
        let oneDayHistory = oneDayData?.[pair.poolAddress]
        let twoDayHistory = twoDayData?.[pair.poolAddress]
        let oneWeekHistory = oneWeekData?.[pair.poolAddress]
        data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory)
        return data
      })
    )
    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData) {
  // get volume changes
  // let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
  //   data?.volumeUSD,
  //   oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
  //   twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  // )
  const oneDayVolumeUSD = oneDayData?.volumeUSD || 0
  const twoDayVolumeUSD = twoDayData?.volumeUSD || 0
  const volumeChangeUSD = (oneDayVolumeUSD - twoDayVolumeUSD) / oneDayVolumeUSD * 100;
  const oneDayFeesUSD = oneDayData?.feesUSD || 0
  const twoDayFeesUSD = twoDayData?.feesUSD || 0
  const feesChangeUSD = (oneDayFeesUSD - twoDayFeesUSD) / oneDayFeesUSD * 100;


  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  )

  const oneWeekVolumeUSD = parseFloat(oneWeekData?.volumeUSD ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)
  const oneWeekVolumeUntracked = parseFloat(
    oneWeekData?.untrackedVolumeUSD ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD : data.untrackedVolumeUSD
  )

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeUntracked = oneDayVolumeUntracked
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked
  data.volumeChangeUntracked = volumeChangeUntracked

  data.oneDayFeesUSD = oneDayFeesUSD;
  data.feesChangeUSD = feesChangeUSD;

  // set liquidity properties
  data.trackedReserveUSD = data.totalValueLockedUSD
  // data.trackedReserveUSD = data.totalValueLockedETH * ethPrice //??
  data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

  // format if pair hasnt existed for a day or a week
  // if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
  //   data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  // }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD)
  }

  return data
}

const getTopPools = async (whitelistedIds = []) => {
  try {
    let poolsIds = await jediSwapClient.query({
      query: TOP_POOLS_DATA({ tokenIds: whitelistedIds }),
      fetchPolicy: 'network-only',
    })
    const ids = poolsIds?.data?.poolsDayData?.reduce((accum, { pool }) => {
      if (!accum.includes(pool.poolAddress)) {
        accum.push(pool.poolAddress)
      }
      return accum
    }, [])
    const bulkResults = getBulkPairData(ids)
    return bulkResults
    // calculate percentage changes and daily changes
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
      let topPairs = await getTopPools(Object.keys(whitelistedTokens))
      topPairs && updateTopPairs(topPairs)
    }
    getData()
  }, [updateTopPairs, whitelistedTokens])
  return null
}

export function usePairDataForList(poolAddresses) {
  const [state, { update }] = usePairDataContext()
  const allPoolData = useAllPairData()

  const untrackedAddresses = poolAddresses.reduce((accum, address) => {
    if (!Object.keys(allPoolData).includes(address) && isStarknetAddress(address)) {
      accum.push(address)
    }
    return accum
  }, [])

  // filter for pools with data
  const poolsWithData = poolAddresses
    .map((address) => {
      const poolData = allPoolData[address]
      return poolData ?? undefined
    })
    .filter((v) => !!v)

  useEffect(() => {
    async function fetchData(addresses = []) {
      if (!addresses.length) {
        return
      }
      let data = await getBulkPairData(addresses)
      data &&
        data.forEach((p) => {
          update(p.poolAddress, p)
        })
    }
    if (untrackedAddresses.length) {
      fetchData(untrackedAddresses)
    }
  }, [untrackedAddresses, update])

  return poolsWithData
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const pairData = state?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        getBulkPairData([pairAddress]).then((data) => {
          update(pairAddress, data[0])
        })
      }
    }
    if (!pairData && pairAddress && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update])

  return pairData || {}
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  return state || {}
}
