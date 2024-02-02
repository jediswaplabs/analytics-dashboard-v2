import React, { createContext, useContext, useReducer, useMemo, useCallback, useState, useEffect } from 'react'
import { DEFAULT_TOKENS_WHITELIST, SUPPORTED_LIST_URLS__NO_ENS, timeframeOptions } from '../../constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { jediSwapClient } from '../../apollo/v1/client'
// import { GET_LATEST_BLOCK } from '../../apollo/v1/queries'
import { convertDateToUnixFormat } from '../../utils'
import getTokenList from '../../utils/tokenLists'
import { number as starknetNumberModule } from 'starknet'
import { isEmpty } from 'lodash'
dayjs.extend(utc)

const LATEST_STARKNET_BLOCK_URL = 'https://starknet-mainnet.public.blastapi.io/'

const UPDATE = 'UPDATE'
const UPDATE_TIMEFRAME = 'UPDATE_TIMEFRAME'
const UPDATE_SESSION_START = 'UPDATE_SESSION_START'
const UPDATED_SUPPORTED_TOKENS = 'UPDATED_SUPPORTED_TOKENS'
const UPDATED_WHITELISTED_TOKENS = 'UPDATED_WHITELISTED_TOKENS'
const UPDATE_LATEST_BLOCK = 'UPDATE_LATEST_BLOCK'
const UPDATE_HEAD_BLOCK = 'UPDATE_HEAD_BLOCK'

const SUPPORTED_TOKENS = 'SUPPORTED_TOKENS'
const WHITELISTED_TOKENS = 'WHITELISTED_TOKENS'
const TIME_KEY = 'TIME_KEY'
const CURRENCY = 'CURRENCY'
const SESSION_START = 'SESSION_START'
const LATEST_BLOCK = 'LATEST_BLOCK'
const HEAD_BLOCK = 'HEAD_BLOCK'

const ApplicationContext = createContext()

function useApplicationContext() {
  return useContext(ApplicationContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { currency } = payload
      return {
        ...state,
        [CURRENCY]: currency,
      }
    }

    case UPDATE_SESSION_START: {
      const { timestamp } = payload
      return {
        ...state,
        [SESSION_START]: timestamp,
      }
    }

    case UPDATED_WHITELISTED_TOKENS: {
      const { whitelistedTokens } = payload
      return {
        ...state,
        [WHITELISTED_TOKENS]: whitelistedTokens,
      }
    }
    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

const INITIAL_STATE = {
  CURRENCY: 'USD',
  TIME_KEY: timeframeOptions.ALL_TIME,
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const update = useCallback((currency) => {
    dispatch({
      type: UPDATE,
      payload: {
        currency,
      },
    })
  }, [])

  const updateSessionStart = useCallback((timestamp) => {
    dispatch({
      type: UPDATE_SESSION_START,
      payload: {
        timestamp,
      },
    })
  }, [])

  const updateWhitelistedTokens = useCallback((whitelistedTokens) => {
    dispatch({
      type: UPDATED_WHITELISTED_TOKENS,
      payload: {
        whitelistedTokens,
      },
    })
  }, [])

  const updateLatestBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_LATEST_BLOCK,
      payload: {
        block,
      },
    })
  }, [])

  const updateHeadBlock = useCallback((block) => {
    dispatch({
      type: UPDATE_HEAD_BLOCK,
      payload: {
        block,
      },
    })
  }, [])

  return (
    <ApplicationContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updateSessionStart,
            updateWhitelistedTokens,
            updateLatestBlock,
            updateHeadBlock,
          },
        ],
        [state, update, updateSessionStart, updateWhitelistedTokens, updateLatestBlock, updateHeadBlock]
      )}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

// keep track of session length for refresh ticker
export function useSessionStart() {
  const [state, { updateSessionStart }] = useApplicationContext()
  const sessionStart = state?.[SESSION_START]

  useEffect(() => {
    if (!sessionStart) {
      updateSessionStart(Date.now())
    }
  })

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval = null
    interval = setInterval(() => {
      setSeconds(Date.now() - sessionStart ?? Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, sessionStart])

  return parseInt(seconds / 1000)
}
//TODO JediSwap fix

// export function useLatestBlocks() {
//   const [state, { updateLatestBlock, updateHeadBlock }] = useApplicationContext()
//
//   const latestBlock = state?.[LATEST_BLOCK]
//   const headBlock = state?.[HEAD_BLOCK]
//
//   useEffect(() => {
//     async function fetchData() {
//       const getLatestBlockPromise = jediSwapClient.query({
//         query: GET_LATEST_BLOCK,
//       })
//
//       const getLatestHeadBlockPromise = fetch(LATEST_STARKNET_BLOCK_URL, {
//         method: 'POST',
//         body: JSON.stringify({
//           jsonrpc: '2.0',
//           method: 'starknet_blockHashAndNumber',
//           id: 0,
//         }),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//
//       Promise.all([getLatestBlockPromise, getLatestHeadBlockPromise])
//         .then(async ([latestBlockRes, headBlockRes]) => {
//           const parsedHeadBlockResult = await headBlockRes.json()
//           const syncedBlockResult = latestBlockRes?.data?.blocks?.[0]
//           const syncedBlock = syncedBlockResult
//             ? {
//                 ...syncedBlockResult,
//                 timestamp: convertDateToUnixFormat(syncedBlockResult.timestamp),
//               }
//             : null
//           const headBlock = parsedHeadBlockResult
//             ? {
//                 id: parsedHeadBlockResult?.result?.block_hash,
//                 number: parsedHeadBlockResult?.result?.block_number,
//                 // timestamp: parsedHeadBlockResult.timestamp,
//               }
//             : null
//           if (syncedBlock && headBlock) {
//             updateLatestBlock(syncedBlock)
//             updateHeadBlock(headBlock)
//           }
//         })
//         .catch((e) => {
//           console.log(e)
//         })
//     }
//     if (!latestBlock) {
//       fetchData()
//     }
//   }, [latestBlock, updateHeadBlock, updateLatestBlock])
//
//   return [latestBlock, headBlock]
// }

export function useWhitelistedTokens() {
  const [state, { updateWhitelistedTokens }] = useApplicationContext()
  const whitelistedTokens = state?.[WHITELISTED_TOKENS] ?? []

  useEffect(() => {
    async function fetchList() {
      const allFetched = await SUPPORTED_LIST_URLS__NO_ENS.reduce(async (fetchedTokens, url) => {
        const tokensSoFar = await fetchedTokens
        const newTokens = await getTokenList(url)

        if (newTokens?.tokens) {
          return Promise.resolve([...(tokensSoFar ?? []), ...newTokens.tokens])
        }
      }, Promise.resolve([]))
      let formatted = allFetched?.reduce((acc, { address, symbol, logoURI }) => {
        acc[starknetNumberModule.cleanHex(address.toLowerCase())] = {
          symbol,
          logoURI,
        }
        return acc
      }, {})
      updateWhitelistedTokens(formatted)
    }
    if (isEmpty(whitelistedTokens)) {
      try {
        fetchList()
      } catch {
        console.log('Error fetching')
      }
    }
  }, [updateWhitelistedTokens, whitelistedTokens])

  return { ...DEFAULT_TOKENS_WHITELIST, ...whitelistedTokens }
}
