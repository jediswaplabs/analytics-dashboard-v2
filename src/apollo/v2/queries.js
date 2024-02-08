import gql from 'graphql-tag'

//TODO JEDISWAP replcaw with new pool
const ETH_USDC_PAIR_ADDRESS = '0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a'

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

export const GLOBAL_DATA = (block) => {
  const queryString = ` query jediswapFactories {
      factories${block ? `(block: { number: ${block}})` : ``} {
        totalVolumeUSD
        totalVolumeETH
        untrackedVolumeUSD
        totalValueLockedETH
        totalValueLockedUSD
        totalFeesETH
        totalFeesUSD
      }
    }`
  return gql(queryString)
}

export const ETH_PRICE = (block) => {
  const queryString = block
    ? `
    query price {
      pairs(first: 1, block: {number: ${block}} where: {id: "${ETH_USDC_PAIR_ADDRESS}"}
      ) {
        id
        token1Price
      }
    }
  `
    : `
    query price {
      pairs(first: 1, where: {id: "${ETH_USDC_PAIR_ADDRESS}"}
      ) {
        id
        token1Price
      }
    }
  `
  return gql(queryString)
}

export const ALL_PAIRS = (ids = []) => {
  let tokenString = `[`
  ids.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  //TODO JEDISWAP apply filters, fix data
  // token0 {
  //   id
  //   symbol
  //   name
  // }
  // token1 {
  //   id
  //   symbol
  //   name
  // }
  // процент пула
  //
  // добавить ключ first order orderBy

  let queryString = `
    query pools {
      pools(first: 100, orderBy: "totalValueLockedETH", orderByDirection: "desc") {
        poolAddress
        fee
        token0 {
          tokenAddress
          symbol
          name
        }
        token1 {
          tokenAddress
          symbol
          name
        }
      }
    }
  `
  return gql(queryString)
}

export const TOKENS_DATA = (ids = []) => {
  const tokenString = `[${ids.map((token) => `"${token}"`).join(',')}]`
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

export const HISTORICAL_TOKENS_DATA = (ids = [], periods = []) => {
  const tokenString = `[${ids.map((token) => `"${token}"`).join(',')}]`
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

export const TOKEN_PAIRS_DATA = (tokenAddress, block) => {
  const queryString = `
    ${TokenFields}
    query tokens {
      tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
        ...TokenFields
      }
      pairs0: pools(where: {token0Address: "${tokenAddress}"}, first: 50, orderBy: "totalValueLockedUSD", orderByDirection: "desc"){
        id
      }
      pairs1: pairs(where: {token1Address: "${tokenAddress}"}, first: 50, orderBy: "totalValueLockedUSD", orderByDirection: "desc"){
        id
      }
    }
  `
  return gql(queryString)
}

// used for getting top tokens by daily volume
export const TOP_TOKENS_DATA = (ids = []) => {
  const tokenString = `[${ids.map((token) => `"${token}",`)}]`

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

const PairFields = `
  fragment PairFields on Pool {
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
    #totalSupply
    #trackedReserveETH
    totalValueLockedETH
    #reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    fee
    #createdAtTimestamp
  }
`

export const PAIRS_CURRENT = gql`
  query pools {
    pools(first: 200, orderBy: "totalValueLockedUSD", orderByDirection: "desc") {
      poolAddress
    }
  }
`

export const PAIRS_BULK = (pairs) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'

  const queryString = `
    ${PairFields}
    query pools {
      pools(first: 100, where: { poolAddressIn: ${pairsString} }, orderBy: "totalValueLockedETH", orderByDirection: "desc") {
        ...PairFields
      }
    }
  `
  return gql(queryString)
}

//TODO replace block for periods
export const PAIR_DATA = (pairAddress, block) => {
  const queryString = `
    ${PairFields}
    query pools {
      pools(${block ? `block: {number: ${block}}` : ``} where: { poolAddress: "${pairAddress}"} ) {
        ...PairFields
      }
    }`
  return gql(queryString)
}

export const PAIRS_HISTORICAL_BULK = (pairs, periods = []) => {
  let pairsString = `[`
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const periodString = `[${periods.map((period) => `"${period}"`).join(',')}]`
  let queryString = `
  query poolsData {
    poolsData(first: 200, where: {poolAddressIn: ${pairsString}, periodIn: ${periodString}}, orderBy: "totalValueLockedETH", orderByDirection: "desc") {
      period
      poolAddress
    }
  }
  `
  return gql(queryString)
}
