import gql from 'graphql-tag'

const TokenFields = `
  fragment TokenFields on Token {
    tokenAddress
    name
    symbol
    derivedETH
    volume
    volumeUSD
    untrackedVolumeUSD
    totalValueLocked
    totalValueLockedUSD
    txCount
    feesUSD
  }
`

const PoolFields = `
  fragment PoolFields on Pool {
    poolAddress
    txCount
    token0 {
      tokenAddress
      symbol
      name
      totalValueLocked
      derivedETH
    }
    token1 {
      tokenAddress
      symbol
      name
      totalValueLocked
      derivedETH
    }
    volumeToken0
    volumeToken1
    totalValueLockedUSD
    totalValueLockedETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    totalValueLockedToken0
    totalValueLockedToken1
    token0Price
    token1Price
    fee
  }
`


export const HISTORICAL_GLOBAL_DATA = () => {
  const queryString = ` query jediswapFactories {
      factoriesDayData(first: 2, orderBy: "dayId", orderByDirection: "desc") {
        totalValueLockedUSD
        volumeUSD
        feesUSD
        dayId
        id
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

export const HISTORICAL_POOLS_DATA = ({ poolIds = [], tokenIds = [], periods = [] }) => {
  const poolsString = `[${poolIds.map((pool) => `"${pool}"`).join(',')}]`
  const tokensString = `[${tokenIds.map((token) => `"${token}",`)}]`
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`

  let queryString = `
    ${PoolFields}
    query poolsData {
      poolsData(
        first: 500, 
        where: {
          poolAddressIn: ${poolsString}, 
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
