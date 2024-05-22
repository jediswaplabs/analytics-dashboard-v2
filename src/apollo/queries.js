import gql from 'graphql-tag'
import { apiTimeframeOptions } from '../constants/index.js'

const TokenFields = `
  fragment TokenFields on Token {
    tokenAddress
    name
    symbol
    volume
    volumeUSD
    totalValueLocked
    totalValueLockedUSD
    feesUSD
  }
`

const PoolFields = `
  fragment PoolFields on Pool {
    poolAddress
    token0 {
      tokenAddress
      symbol
      name
      #totalValueLocked
    }
    token1 {
      tokenAddress
      symbol
      name
      #totalValueLocked
    }
    volumeToken0
    volumeToken1
    volumeUSD
    totalValueLockedUSD
    totalValueLockedETH
    totalValueLockedToken0
    totalValueLockedToken1
    token0Price
    token1Price
    fee
  }
`


export const HISTORICAL_GLOBAL_DATA = () => {
  const queryString = ` query jediswapFactories {
    factoriesData {
      ${apiTimeframeOptions.oneDay}
      ${apiTimeframeOptions.twoDays}
    }
  }`
  return gql(queryString)
}

export const GLOBAL_CHART = gql`
  query exchangeDayDatas($startTime: Int!, $skip: Int!) {
    exchangeDayDatas(first: 1000, skip: $skip, where: { dateGt: $startTime }, orderBy: "date", orderByDirection: "asc") {
      id
      date
      dailyVolumeUSD
      dailyVolumeETH
      totalVolumeUSD
      totalLiquidityUSD
      totalLiquidityETH
    }
  }
`


export const HISTORICAL_TOKENS_DATA = ({ tokenIds = [], periods = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}"`).join(',')}]`
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`

  let queryString = `
    ${TokenFields}
    query tokensData {
      tokensData(first: 500, where: {tokenAddressIn: ${tokenString}, periodIn: ${periodString}}) {
        token{...TokenFields}
        period
      }
    }
  `
  return gql(queryString)
}

export const HISTORICAL_POOLS_DATA = ({ tokenIds = [], periods = [] }) => {
  const tokensString = `[${tokenIds.map((token) => `"${token}",`)}]`
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`

  let queryString = `
    ${PoolFields}
    query poolsData {
      poolsData(
        first: 500, 
        where: {
          periodIn: ${periodString},
          bothTokenAddressIn: ${tokensString},
        }
      ) {
        pool {
          ...PoolFields
        }
        period
      }
    }
  `
  return gql(queryString)
}

export const VOLUME_LEADERBOARD_DATA = ({ userAddress }) => {
  const whereString = userAddress ? ` where: {userAddress: "${userAddress}"}` : ''
  let queryString = `
    query volumeLeaderboard {
      volumeLeaderboard(first: 100 orderBy: "points" orderByDirection: "desc" ${whereString}) {
        points
        userAddress
      }
    }
  `
  return gql(queryString)
}

export const LP_LEADERBOARD_DATA = ({ userAddress }) => {
  const whereString = userAddress ? ` where: {userAddress: "${userAddress}"}` : ''
  let queryString = `
    query lpLeaderboard {
      lpLeaderboard(first: 100 orderBy: "points" orderByDirection: "desc" ${whereString}) {
        points
        userAddress
      }
    }
  `
  return gql(queryString)
}