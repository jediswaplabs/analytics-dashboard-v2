import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { jediSwapClient } from '../../apollo/v1/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { get2DayPercentChange, getBlockFromTimestamp, getBlocksFromTimestamps, getPercentChange } from '../../utils'
import { GLOBAL_DATA, TOKENS } from '../../apollo/v1/queries'
import { useWhitelistedTokens } from './Application'
import { TOKEN_DATA, TOKENS_HISTORICAL_BULK } from '../../apollo/queries'
import { updateNameData } from '../../utils/data'

const UPDATE = 'UPDATE'
const UPDATE_TXNS = 'UPDATE_TXNS'
const UPDATE_CHART = 'UPDATE_CHART'
const UPDATE_ETH_PRICE = 'UPDATE_ETH_PRICE'
const ETH_PRICE_KEY = 'ETH_PRICE_KEY'
const UPDATE_ALL_PAIRS_IN_JEDISWAP = 'UPDAUPDATE_ALL_PAIRS_IN_JEDISWAPTE_TOP_PAIRS'
const UPDATE_ALL_TOKENS_IN_JEDISWAP = 'UPDATE_ALL_TOKENS_IN_JEDISWAP'
const UPDATE_TOP_LPS = 'UPDATE_TOP_LPS'

const GlobalDataContext = createContext()

function useGlobalDataContext() {
  return useContext(GlobalDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { data } = payload
      return {
        ...state,
        globalData: data,
      }
    }
    case UPDATE_ALL_PAIRS_IN_JEDISWAP: {
      const { allPairs } = payload
      return {
        ...state,
        allPairs,
      }
    }

    case UPDATE_ALL_TOKENS_IN_JEDISWAP: {
      const { allTokens } = payload
      return {
        ...state,
        allTokens,
      }
    }

    case UPDATE_ETH_PRICE: {
      const { ethPrice, oneDayPrice, ethPriceChange } = payload
      return {
        [ETH_PRICE_KEY]: ethPrice,
        oneDayPrice,
        ethPriceChange,
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

/**
 * Gets the current price  of ETH, 24 hour price, and % change between them
 */
const getEthPrice = async () => {
  const utcCurrentTime = dayjs()
  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()

  let ethPrice = 0
  let ethPriceOneDay = 0
  let priceChangeETH = 0

  try {
    //TODO JEDISWAP replace with real data
    // let result = await jediSwapClient.query({
    //   query: ETH_PRICE(),
    //   fetchPolicy: 'cache-first',
    // })
    // let resultOneDay = await jediSwapClient.query({
    //   query: ETH_PRICE(),
    //   fetchPolicy: 'cache-first',
    // })
    // const currentPrice = result?.data?.pairs[0].token1Price
    // const oneDayBackPrice = resultOneDay?.data?.pairs[0].token1Price
    const currentPrice = 2500
    const oneDayBackPrice = 2200
    priceChangeETH = getPercentChange(currentPrice, oneDayBackPrice)
    ethPrice = currentPrice
    ethPriceOneDay = oneDayBackPrice
  } catch (e) {
    console.log(e)
  }

  return [ethPrice, ethPriceOneDay, priceChangeETH]
}

/**
 * Gets all the global data for the overview page.
 * Needs current eth price and the old eth price to get
 * 24 hour USD changes.
 * @param {*} ethPrice
 * @param {*} oldEthPrice
 */
async function getGlobalData(ethPrice, oldEthPrice) {
  // data for each day , historic data used for % changes
  let data = {}
  let oneDayData = {}

  try {
    // get timestamps for the days
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()

    // get the blocks needed for time travel queries
    // let [oneDayBlock] = await getBlocksFromTimestamps([utcOneDayBack])

    // fetch the global data
    let result = await jediSwapClient.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    data = result.data.factories[0]

    //TODO JEDISWAP replace with one day result
    // fetch the historical data
    // let oneDayResult = await jediSwapClient.query({
    //   query: GLOBAL_DATA(oneDayBlock?.number),
    //   fetchPolicy: 'cache-first',
    // })
    // oneDayData = oneDayResult.data.factories[0]

    let oneDayResult = await jediSwapClient.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    oneDayData = oneDayResult.data.factories[0]

    if (data && oneDayData) {
      let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(data.totalVolumeUSD, oneDayData.totalVolumeUSD)

      // format the total liquidity in USD
      const liquidityChangeUSD = getPercentChange(data.totalValueLockedUSD, oneDayData.totalValueLockedUSD)

      // add relevant fields with the calculated amounts
      data.oneDayVolumeUSD = oneDayVolumeUSD
      data.volumeChangeUSD = volumeChangeUSD
      data.liquidityChangeUSD = liquidityChangeUSD
    }
  } catch (e) {
    console.log(e)
  }
  return data
}

/**
 * Loop through every whitelisted token on JediSwap
 */
async function getTokens(ids = [], ethPrice, ethPriceOld) {
  const utcCurrentTime = dayjs()
  // const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
  // const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
  // let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
  // let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)

  if (!ids?.length) {
    return {}
  }

  try {
    let currentResult = await jediSwapClient.query({
      query: TOKENS(ids),
      fetchPolicy: 'cache-first',
    })

    let oneDayResult = await jediSwapClient.query({
      // TODO JEDISWAP replace with real historic data
      // query: TOKENS(ids, oneDayBlock),
      query: TOKENS(ids),
      fetchPolicy: 'cache-first',
    })

    // let twoDayResult = await jediSwapClient.query({
    //   // TODO JEDISWAP replace with real historic data
    //   // query: TOKENS(ids, twoDayBlock),
    //   query: TOKENS(ids),
    //   fetchPolicy: 'cache-first',
    // })

    let currentResultData = currentResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.tokenAddress]: cur }
    }, {})

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.tokenAddress]: cur }
    }, {})

    // let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
    //   return { ...obj, [cur.tokenAddress]: cur }
    // }, {})

    if (!(currentResultData && oneDayResult)) {
      return {}
    }

    const bulkResult = Object.keys(currentResultData).map((tokenAddress) => {
      let tokenData = currentResultData[tokenAddress]
      let oneDayTokenData = oneDayData?.[tokenAddress] ?? {}

      const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(tokenData.volumeUSD, oneDayData?.volumeUSD ?? 0)

      const priceChangeUSD = getPercentChange(
        tokenData?.derivedETH * ethPrice,
        oneDayTokenData?.derivedETH ? oneDayTokenData?.derivedETH * ethPriceOld : 0
      )

      tokenData.priceUSD = tokenData?.derivedETH * ethPrice
      tokenData.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
      tokenData.volumeChangeUSD = volumeChangeUSD
      tokenData.priceChangeUSD = priceChangeUSD
      tokenData.liquidityChangeUSD = getPercentChange(tokenData.totalValueLockedUSD ?? 0, oneDayTokenData.totalValueLockedUSD ?? 0)

      tokenData.oneDayData = oneDayTokenData

      return tokenData
    })
    return bulkResult
  } catch (e) {
    console.log(e)
  }
}

// const getBulkTokenData = async (ids, ethPrice, ethPriceOld) => {
//   const utcCurrentTime = dayjs()
//   const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
//   const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
//   let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack)
//   let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack)
//
//   try {
//     let current = await jediSwapClient.query({
//       query: TOKENS_HISTORICAL_BULK(ids),
//       fetchPolicy: 'cache-first',
//     })
//     let oneDayResult = await jediSwapClient.query({
//       query: TOKENS_HISTORICAL_BULK(ids, oneDayBlock),
//       fetchPolicy: 'cache-first',
//     })
//
//     let twoDayResult = await jediSwapClient.query({
//       query: TOKENS_HISTORICAL_BULK(ids, twoDayBlock),
//       fetchPolicy: 'cache-first',
//     })
//
//     let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
//       return { ...obj, [cur.id]: cur }
//     }, {})
//
//     let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
//       return { ...obj, [cur.id]: cur }
//     }, {})
//     let bulkResults = await Promise.all(
//         current &&
//         oneDayData &&
//         twoDayData &&
//         current?.data?.tokens.map(async (token) => {
//           let data = token
//
//           // let liquidityDataThisToken = liquidityData?.[token.id]
//           let oneDayHistory = oneDayData?.[token.id]
//           let twoDayHistory = twoDayData?.[token.id]
//
//           // catch the case where token wasn't in top list in previous days
//           if (!oneDayHistory) {
//             let oneDayResult = await jediSwapClient.query({
//               query: TOKEN_DATA(token.id, oneDayBlock),
//               fetchPolicy: 'cache-first',
//             })
//             oneDayHistory = oneDayResult.data.tokens[0]
//           }
//           if (!twoDayHistory) {
//             let twoDayResult = await jediSwapClient.query({
//               query: TOKEN_DATA(token.id, twoDayBlock),
//               fetchPolicy: 'cache-first',
//             })
//             twoDayHistory = twoDayResult.data.tokens[0]
//           }
//
//           // calculate percentage changes and daily changes
//           const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
//               data.tradeVolumeUSD,
//               oneDayHistory?.tradeVolumeUSD ?? 0,
//               twoDayHistory?.tradeVolumeUSD ?? 0
//           )
//           const [oneDayTxns, txnChange] = get2DayPercentChange(data.txCount, oneDayHistory?.txCount ?? 0, twoDayHistory?.txCount ?? 0)
//
//           const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH
//           const oldLiquidityUSD = oneDayHistory?.totalLiquidity * ethPriceOld * oneDayHistory?.derivedETH
//
//           // percent changes
//           const priceChangeUSD = getPercentChange(
//               data?.derivedETH * ethPrice,
//               oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0
//           )
//           // set data
//           data.priceUSD = data?.derivedETH * ethPrice
//           data.totalLiquidityUSD = currentLiquidityUSD
//           data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
//           data.volumeChangeUSD = volumeChangeUSD
//           data.priceChangeUSD = priceChangeUSD
//           data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0)
//           data.oneDayTxns = oneDayTxns
//           data.txnChange = txnChange
//
//           // new tokens
//           if (!oneDayHistory && data) {
//             data.oneDayVolumeUSD = data.tradeVolumeUSD
//             data.oneDayVolumeETH = data.tradeVolume * data.derivedETH
//             data.oneDayTxns = data.txCount
//           }
//
//           // update name data for
//           updateNameData({
//             token0: data,
//           })
//
//           // used for custom adjustments
//           data.oneDayData = oneDayHistory
//           data.twoDayData = twoDayHistory
//
//           return data
//         })
//     )
//
//     return bulkResults
//
//     // calculate percentage changes and daily changes
//   } catch (e) {
//     console.log(e)
//   }
// }

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback((data) => {
    dispatch({
      type: UPDATE,
      payload: {
        data,
      },
    })
  }, [])

  const updateAllPairsInJediSwap = useCallback((allPairs) => {
    dispatch({
      type: UPDATE_ALL_PAIRS_IN_JEDISWAP,
      payload: {
        allPairs,
      },
    })
  }, [])

  const updateAllTokensInJediSwap = useCallback((allTokens) => {
    dispatch({
      type: UPDATE_ALL_TOKENS_IN_JEDISWAP,
      payload: {
        allTokens,
      },
    })
  }, [])

  const updateEthPrice = useCallback((ethPrice, oneDayPrice, ethPriceChange) => {
    dispatch({
      type: UPDATE_ETH_PRICE,
      payload: {
        ethPrice,
        oneDayPrice,
        ethPriceChange,
      },
    })
  }, [])

  return (
    <GlobalDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateEthPrice,
            updateAllPairsInJediSwap,
            updateAllTokensInJediSwap,
          },
        ],
        [state, update, updateEthPrice, updateAllPairsInJediSwap, updateAllTokensInJediSwap]
      )}
    >
      {children}
    </GlobalDataContext.Provider>
  )
}

export function useEthPrice() {
  const [state, { updateEthPrice }] = useGlobalDataContext()
  const ethPrice = state?.[ETH_PRICE_KEY]
  const ethPriceOld = state?.['oneDayPrice']
  useEffect(() => {
    async function checkForEthPrice() {
      if (!ethPrice) {
        let [newPrice, oneDayPrice, priceChange] = await getEthPrice()
        updateEthPrice(newPrice, oneDayPrice, priceChange)
      }
    }
    checkForEthPrice()
  }, [ethPrice, updateEthPrice])

  return [ethPrice, ethPriceOld]
}

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  const [state, { update, updateAllPairsInJediSwap, updateAllTokensInJediSwap }] = useGlobalDataContext()
  const [ethPrice, oldEthPrice] = useEthPrice()
  const whitelistedTokens = useWhitelistedTokens() ?? {}
  const data = state?.globalData

  useEffect(() => {
    async function fetchData() {
      let globalData = await getGlobalData(ethPrice, oldEthPrice)
      globalData && update(globalData)

      // TODO JEDISWAP
      // let allPairs = await getAllPairsOnJediswap()
      // updateAllPairsInJediSwap(allPairs)

      let allTokens = await getTokens(Object.keys(whitelistedTokens), ethPrice, oldEthPrice)
      updateAllTokensInJediSwap(allTokens)
    }
    if (!data && ethPrice && oldEthPrice) {
      fetchData()
    }
  }, [ethPrice, oldEthPrice, update, data, updateAllPairsInJediSwap, updateAllTokensInJediSwap])

  return data || {}
}
