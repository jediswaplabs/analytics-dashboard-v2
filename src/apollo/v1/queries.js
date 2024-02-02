import gql from 'graphql-tag'

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

export const TOKENS = (ids) => {
  let tokenString = `[`
  ids.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  let queryString = `
    query tokens {
      tokens(first: 500, where: {tokenAddressIn: ${tokenString}}) {
        tokenAddress
        name
        symbol
        derivedETH
        volume
        volumeUSD
        untrackedVolumeUSD
        totalValueLocked
        totalValueLockedUSD
      }
    }
  `
  return gql(queryString)
}

export const TOKENS_DAY_DATA = (ids) => {
  let tokenString = `[`
  ids.map((token) => {
    return (tokenString += `"${token}",`)
  })
  tokenString += ']'
  let queryString = `
    query tokensDayData {
      tokens(first: 500, where: {tokenAddressIn: ${tokenString}}) {
        tokenAddress
        name
        symbol
        derivedETH
        volume
        volumeUSD
        untrackedVolumeUSD
        totalValueLocked
        totalValueLockedUSD
      }
    }
  `
  return gql(queryString)
}
