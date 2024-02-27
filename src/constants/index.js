import { isStagingEnvironment, isTestnetEnvironment } from '../utils'

const getDefaultTokensListUrl = () => {
  const getUrl = (env = '', name = 'jediswap-default.tokenlist.json') => `https://static.${env ? `${env}.` : ''}jediswap.xyz/tokens-list/${name}`

  if (isStagingEnvironment()) {
    return getUrl('staging')
  }

  if (isTestnetEnvironment()) {
    return getUrl('testnet')
  }

  return getUrl()
}

export const getApiUrl = () => {
  if (isTestnetEnvironment()) {
    return 'https://api.goerli.jediswap.xyz/graphql'
  }
  return 'https://api.jediswap.xyz/graphql'
}
export const STARKNET_REWARDS_API_URL = 'https://kx58j6x5me.execute-api.us-east-1.amazonaws.com//starknet/fetchFile?file=qa_strk_grant.json'

export const apiTimeframeOptions = {
  oneDay: 'one_day',
  twoDays: 'two_days',
  oneWeek: 'one_week',
  oneMonth: 'one_month',
}

export const timeframeOptions = {
  WEEK: '1 week',
  MONTH: '1 month',
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  HALF_YEAR: '6 months',
  ALL_TIME: 'All time',
}

// token list urls to fetch tokens from - use for warnings on tokens and pairs
export const SUPPORTED_LIST_URLS__NO_ENS = [getDefaultTokensListUrl(), 'https://cloudflare-ipfs.com/ipns/tokens.jediswap.xyz/']

export const DEFAULT_TOKENS_WHITELIST = {
  ...(isTestnetEnvironment() && {
    '0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9': {
      symbol: 'DAI',
      logoURI: require('../assets/tokens/0x6B175474E89094C44Da98b954EedeAC495271d0F.png'),
    },
    '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426': {
      symbol: 'USDC',
      logoURI: require('../assets/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png'),
    },
    '0x6a8f0e0d3bf9a6f049ce3fcbad7e26cbd0ceb3f0bfc6160f4ab7bdd7985b0e3': {
      symbol: 'USDT',
      logoURI: require('../assets/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7.png'),
    },
    '0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56': {
      symbol: 'WBTC',
      logoURI: require('../assets/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.png'),
    },
  }),
  ...(!isTestnetEnvironment() && {
    '0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3': {
      symbol: 'DAIv0',
      logoURI: require('../assets/tokens/0x6B175474E89094C44Da98b954EedeAC495271d0F.png'),
    },
    '0x5574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad': {
      symbol: 'DAI',
      logoURI: require('../assets/tokens/0x6B175474E89094C44Da98b954EedeAC495271d0F.png'),
    },
    '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8': {
      symbol: 'USDC',
      logoURI: require('../assets/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48.png'),
    },
    '0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8': {
      symbol: 'USDT',
      logoURI: require('../assets/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7.png'),
    },
    '0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac': {
      symbol: 'WBTC',
      logoURI: require('../assets/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.png'),
    },
    '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7': {
      symbol: 'ETH',
      logoURI: require('../assets/tokens/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7.png'),
    },
  }),
}

// warnings to display if page contains info about blocked token
export const BLOCKED_WARNINGS = {}

/**
 * For tokens that cause errors on fee calculations
 */
export const FEE_WARNING_TOKENS = []

export const UNTRACKED_COPY = 'Derived USD values may be inaccurate without liquid stablecoin or ETH pairings.'

// pairs that should be tracked but aren't due to lag in subgraph
export const TRACKED_OVERRIDES_PAIRS = []

// tokens that should be tracked but aren't due to lag in subgraph
// all pairs that include token will be tracked
export const TRACKED_OVERRIDES_TOKENS = []
