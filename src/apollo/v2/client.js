import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const jediSwapClientV2 = new ApolloClient({
  link: new HttpLink({
    // uri: 'https://api.v2.goerli.jediswap.xyz/graphql',
    uri: 'https://31fe-106-51-167-171.ngrok-free.app/graphql',
    headers: {
      // 'm-color': 'blue',
    },
  }),
  cache: new InMemoryCache({
    dataIdFromObject: (object) => {
      switch (object.__typename) {
        // case 'Token': {
        //   return `${object.id}${object.name}`
        // }
        // case 'Swap': {
        //   return `${object.transactionHash}${object.timestamp}`
        // }
        // case 'Mint': {
        //   return `${object.transactionHash}${object.timestamp}`
        // }
        // case 'Burn': {
        //   return `${object.transactionHash}${object.timestamp}`
        // }
        // case 'LiquidityPosition': {
        //   return `${object.user.id}${object.pair.id}`
        // }
        // case 'LiquidityPositionSnapshot': {
        //   return `${object.id}${object.user.id}${object.timestamp}`
        // }
        // case 'ExchangeDayData': {
        //   return `${object.id}${object.date}`
        // }
        // case 'PairDayData': {
        //   return `${object.pairId}${object.date}`
        // }
        case 'TokenDayData': {
          return `${object.tokenAddress}${object.datetime}`
        }
        case 'Token': {
          return `${object.tokenAddress}${object.name}`
        }
        default: {
          return object.id || object._id
        }
      }
    },
  }),
  shouldBatch: true,
})
