import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { jediSwapClient } from '../apollo/client'
import { jediSwapClientV2 } from '../apollo/v2/client'
import { PAIR_CHART, FILTERED_TRANSACTIONS } from '../apollo/queries'
import { PAIRS_CURRENT, PAIRS_BULK, PAIR_DATA, PAIRS_HISTORICAL_BULK } from '../apollo/v2/queries'

import { useEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {
  getPercentChange,
  get2DayPercentChange,
  isAddress,
  getBlocksFromTimestamps,
  getTimestampsForChanges,
  splitQuery,
  convertDateToUnixFormat,
  isStarknetAddress,
} from '../utils'
import { timeframeOptions, TRACKED_OVERRIDES_PAIRS, TRACKED_OVERRIDES_TOKENS } from '../constants'
import { useLatestBlocks } from './Application'
import { updateNameData } from '../utils/data'
import { apiTimeframeOptions } from '../constants'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
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

    case UPDATE_PAIR_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          txns: transactions,
        },
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          chartData,
        },
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

  const updatePairTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, transactions },
    })
  }, [])

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData },
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
            updatePairTxns,
            updateChartData,
            updateTopPairs,
            updateHourlyData,
          },
        ],
        [state, update, updatePairTxns, updateChartData, updateTopPairs, updateHourlyData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(pairList, ethPrice) {
  try {
    let current = await jediSwapClientV2.query({
      query: PAIRS_BULK(pairList),
      fetchPolicy: 'cache-first',
    })

    let historicalData = await jediSwapClientV2.query({
      query: PAIRS_HISTORICAL_BULK(pairList, [apiTimeframeOptions.oneDay, apiTimeframeOptions.twoDays, apiTimeframeOptions.oneWeek]),
      fetchPolicy: 'cache-first',
    })
    let oneDayData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.poolAddress]: cur?.period?.[apiTimeframeOptions.oneDay] }
    }, {})

    let twoDayData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.poolAddress]: cur?.period?.[apiTimeframeOptions.twoDays] }
    }, {})

    let oneWeekData = historicalData?.data?.poolsData.reduce((obj, cur, i) => {
      return { ...obj, [cur.poolAddress]: cur?.period?.[apiTimeframeOptions.oneWeek] }
    }, {})

    let pairData = await Promise.all(
      current &&
      current.data.pools.map(async (pair) => {
        let data = pair
        let oneDayHistory = oneDayData?.[pair.poolAddress]
        if (!oneDayHistory) {
          let newData = await jediSwapClientV2.query({
            query: PAIR_DATA(pair.poolAddress, [apiTimeframeOptions.oneDay]),
            fetchPolicy: 'cache-first',
          })
          oneDayHistory = newData.data.poolsData[0]?.period?.[apiTimeframeOptions.oneDay]
        }
        let twoDayHistory = twoDayData?.[pair.poolAddress]
        if (!twoDayHistory) {
          let newData = await jediSwapClientV2.query({
            query: PAIR_DATA(pair.poolAddress, [apiTimeframeOptions.twoDays]),
            fetchPolicy: 'cache-first',
          })
          twoDayHistory = newData.data.poolsData[0]?.period?.[apiTimeframeOptions.twoDays]
        }
        let oneWeekHistory = oneWeekData?.[pair.poolAddress]
        if (!oneWeekHistory) {
          let newData = await jediSwapClientV2.query({
            query: PAIR_DATA(pair.poolAddress, [apiTimeframeOptions.oneWeek]),
            fetchPolicy: 'cache-first',
          })
          oneWeekHistory = newData.data.poolsData[0]?.period?.[apiTimeframeOptions.oneWeek]
        }
        // data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice, b1)
        data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice)
        return data
      })
    )
    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData, ethPrice, oneDayBlock) {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  )
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  )

  const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)

  const oneWeekVolumeUntracked = parseFloat(oneWeekData ? data?.untrackedVolumeUSD - oneWeekData?.untrackedVolumeUSD : data.untrackedVolumeUSD)

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeUntracked = oneDayVolumeUntracked
  data.oneWeekVolumeUntracked = oneWeekVolumeUntracked
  data.volumeChangeUntracked = volumeChangeUntracked

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

const getPairTransactions = async (pairAddress) => {
  const transactions = {}

  try {
    let result = await jediSwapClient.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress],
      },
      fetchPolicy: 'cache-first',
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getPairChartData = async (pairAddress) => {
  let data = []
  const utcEndTime = dayjs.utc()
  let utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  let startTime = utcStartTime.unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      let result = await jediSwapClient.query({
        query: PAIR_CHART,
        variables: {
          pairAddress: pairAddress,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      skip += 1000

      data = data.concat(result.data.pairDayDatas)

      data = data.map((item) => {
        item.date = convertDateToUnixFormat(item.date)
        item.dailyVolumeToken0 = parseFloat(item.dailyVolumeToken0)
        item.dailyVolumeToken1 = parseFloat(item.dailyVolumeToken1)
        item.dailyVolumeUSD = parseFloat(item.dailyVolumeUSD)
        item.reserveUSD = parseFloat(item.reserveUSD)
        return item
      })

      if (result.data.pairDayDatas.length < 1000) {
        allFound = true
      }
    }

    let dayIndexSet = new Set()
    let dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0].reserveUSD
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD,
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
  } catch (e) {
    console.log(e)
  }

  return data
}

export function Updater() {
  const [, { updateTopPairs }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  useEffect(() => {
    async function getData() {
      // get top pairs by reserves
      let {
        data: { pools },
      } = await jediSwapClientV2.query({
        query: PAIRS_CURRENT,
        fetchPolicy: 'cache-first',
      })

      // format as array of addresses
      const formattedPairs = pools.map((pool) => {
        return pool.poolAddress
      })

      // get data for every pair in list
      let topPairs = await getBulkPairData(formattedPairs, ethPrice)
      topPairs && updateTopPairs(topPairs)
    }
    ethPrice && getData()
  }, [ethPrice, updateTopPairs])
  return null
}

export function usePairDataForList(poolAddresses) {
  const [state, { update }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
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
      let data = await getBulkPairData(addresses, ethPrice)
      data &&
        data.forEach((p) => {
          update(p.id, p)
        })
    }
    if (untrackedAddresses.length) {
      fetchData(untrackedAddresses)
    }
  }, [untrackedAddresses, ethPrice, update])

  return poolsWithData
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const pairData = state?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        let data = await getBulkPairData([pairAddress], ethPrice)
        data && update(pairAddress, data[0])
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update, ethPrice])

  return pairData || {}
}

/**
 * Get most recent txns for a pair
 */
export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const pairTxns = state?.[pairAddress]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        let transactions = await getPairTransactions(pairAddress)
        updatePairTxns(pairAddress, transactions)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const [state, { updateChartData }] = usePairDataContext()
  const chartData = state?.[pairAddress]?.chartData

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        let data = await getPairChartData(pairAddress)
        updateChartData(pairAddress, data)
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, updateChartData])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  return state || {}
}
