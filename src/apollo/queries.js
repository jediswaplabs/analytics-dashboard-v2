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
    fee
  }
`

export const GLOBAL_DATA = () => {
  const queryString = ` query jediswapFactories {
      factories {
        totalValueLockedUSD
        totalFeesUSD
        totalVolumeUSD
      }
    }`
  return gql(queryString)
}
export const HISTORICAL_GLOBAL_DATA = () => {
  const queryString = ` query jediswapFactories {
      factoriesDayData {
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

export const TOKENS_DATA = ({ tokenIds = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}"`).join(',')}]`
  let queryString = `
    ${TokenFields}
    query tokens {
      tokens(first: 500, where: {tokenAddressIn: ${tokenString}}) {
        ...TokenFields
      }
    }
  `
  return gql(queryString)
}

export const HISTORICAL_TOKENS_DATA = ({ tokenIds = [], periods = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}"`).join(',')}]`
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`

  let queryString = `
    query tokensData {
      tokensData(first: 500, where: {tokenAddressIn: ${tokenString}, periodIn: ${periodString}}) {
        tokenAddress
        period
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_PAIRS_DATA = ({ tokenId, whitelistedTokenIds = [] }) => {
  const tokenString = `[${whitelistedTokenIds.map((token) => `"${token}"`).join(',')}]`
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(
        where: {
          tokenAddress:"${tokenId}"
        }) {
        ...TokenFields
      }
      pairs: pools(
        first: 50, 
        orderBy: "totalValueLockedUSD", 
        orderByDirection: "desc"
        where: {
          bothTokenAddressIn: ${tokenString}, 
          eitherTokenAddress: "${tokenId}"
        }){
          poolAddress
      }
    }
  `
  return gql(queryString)
}

// used for getting top tokens by daily volume
export const TOP_TOKENS_DATA = ({ tokenIds = [] }) => {
  const tokenString = `[${tokenIds.map((token) => `"${token}",`)}]`

  // добавить ключ where: { dateGt: $date }
  let queryString = `
    query tokensDayData {
      tokensDayData(first: 100, orderByDirection: "desc", orderBy: "day_id", where: {tokenAddressIn: ${tokenString}}) {
        tokenAddress
        datetime
      }
    }
  `
  return gql(queryString)
}

export const POOLS_DATA = ({ poolIds = [], tokenIds = [] }) => {
  const poolsString = `[${poolIds.map((pool) => `"${pool}"`).join(',')}]`
  const tokensString = `[${tokenIds.map((token) => `"${token}",`)}]`
  let queryString = `
    ${PoolFields}
    query pools {
      pools(
        first: 500
        where: {
          poolAddressIn: ${poolsString},
          bothTokenAddressIn: ${tokensString},
        }
      ) {
        ...PoolFields
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
          poolAddress
        }
        period
      }
    }
  `
  return gql(queryString)
}

export const TOP_POOLS_DATA = ({ poolIds = [], tokenIds = [] }) => {
  const poolsString = `[${poolIds.map((pool) => `"${pool}",`)}]`
  const tokensString = `[${tokenIds.map((token) => `"${token}",`)}]`

  let queryString = `
    query poolsDayData {
      poolsDayData(
        first: 100, 
        orderByDirection: "desc", 
        orderBy: "day_id", 
        where: {
          poolAddressIn: ${poolsString},
          bothTokenAddressIn: ${tokensString}
        }
      ) {
        pool {
          poolAddress
        }
        datetime
      }
    }
  `
  return gql(queryString)
}

export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbolContains: $value }, orderBy: "total_liquidity", orderByDirection: "desc") {
      id
      symbol
      name
      totalLiquidity
    }
    asName: tokens(where: { nameContains: $value }, orderBy: "total_liquidity", orderByDirection: "desc") {
      id
      symbol
      name
      totalLiquidity
    }
    asAddress: tokens(where: { id: $id }, orderBy: "total_liquidity", orderByDirection: "desc") {
      id
      symbol
      name
      totalLiquidity
    }
  }
`

export const PAIR_SEARCH = gql`
  query pairs($tokens: [String!], $id: String) {
    as0: pairs(where: { token0In: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    as1: pairs(where: { token1In: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    asAddress: pairs(where: { id: $id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`
