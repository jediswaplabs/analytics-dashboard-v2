import gql from 'graphql-tag'

//TODO JEDISWAP replcaw with new pool
const ETH_USDC_PAIR_ADDRESS = '0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a'

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

export const ALL_TOKENS = (ids = []) => {
  let tokenString = `[`
  ids.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  let queryString = `
    query tokens {
      tokens(first: 100, where: {tokenAddressIn: ${tokenString}}) {
        tokenAddress
        name
        symbol
        totalValueLocked
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
      pools {
        id
        poolAddress
        token0
        token1
      }
    }
  `
  return gql(queryString)
}

// used for getting top tokens by daily volume
export const TOKENS_DAY_DATA = (ids = []) => {
  let tokenString = `[`
  ids.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'

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
