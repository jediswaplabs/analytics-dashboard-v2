import React from 'react'
import { BigNumber } from 'bignumber.js'
import dayjs from 'dayjs'
import { ethers } from 'ethers'
import utc from 'dayjs/plugin/utc'
import { Text } from 'rebass'
import _Decimal from 'decimal.js-light'
import toFormat from 'toformat'
import { timeframeOptions } from '../constants'
import Numeral from 'numeral'
import { validateAndParseAddress, number as starknetNumberModule } from 'starknet'

// format libraries
const Decimal = toFormat(_Decimal)
BigNumber.set({ EXPONENTIAL_AT: 50 })
dayjs.extend(utc)

export const isLocalEnvironment = () => {
  if (!window.location) {
    return false
  }
  if (String(window.location) === '//') {
    return false
  }
  const hostname = new URL(String(window.location))?.hostname || ''
  return hostname === 'localhost'
}

export const isTestnetEnvironment = () => {
  if (!window.location) {
    return false
  }
  if (String(window.location) === '//') {
    return false
  }
  const host = new URL(String(window.location))?.host || ''
  return host === 'info.v2.sepolia.jediswap.xyz' || host === 'info.sepolia.jediswap.xyz'
}

export const isStagingEnvironment = () => {
  if (!window.location) {
    return false
  }
  if (String(window.location) === '//') {
    return false
  }
  const host = new URL(String(window.location))?.host || ''
  return host === 'info.v2.staging.jediswap.xyz'
}

export const isProductionEnvironment = () => {
  if (!window.location) {
    return false
  }
  if (String(window.location) === '//') {
    return false
  }
  const host = new URL(String(window.location))?.host || ''
  return host === 'info.v2.jediswap.xyz'
}

export const zeroStarknetAddress = validateAndParseAddress()

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc()
  // based on window, get starttime
  let utcStartTime
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1
      break
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1
      break
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1
      break
    default:
      utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1
      break
  }
  return utcStartTime
}

export function getPoolLink(token0Address, token1Address = null, remove = false) {
  if (!token1Address) {
    return (
      `https://app.jediswap.xyz/#/` +
      (remove ? `remove` : `add`) +
      `/${token0Address === '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' ? 'ETH' : token0Address}/${'ETH'}`
    )
  } else {
    return (
      `https://app.jediswap.xyz/#/` +
      (remove ? `remove` : `add`) +
      `/${token0Address === '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' ? 'ETH' : token0Address}/${token1Address === '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' ? 'ETH' : token1Address
      }`
    )
  }
}

export function getSwapLink(token0Address, token1Address = null) {
  if (!token1Address) {
    return `https://app.jediswap.xyz/#/swap?inputCurrency=${token0Address}`
  } else {
    return `https://app.jediswap.xyz/#/swap?inputCurrency=${token0Address === '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' ? 'ETH' : token0Address
      }&outputCurrency=${token1Address === '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' ? 'ETH' : token1Address}`
  }
}

export function getUniswapAppLink(linkVariable) {
  let baseUniswapUrl = 'https://app.uniswap.org/#/uni'
  if (!linkVariable) {
    return baseUniswapUrl
  }

  return `${baseUniswapUrl}/ETH/${linkVariable}`
}

export function localNumber(val) {
  return Numeral(val).format('0,0')
}

export const toNiceDate = (date) => {
  let x = dayjs.utc(dayjs.unix(date)).format('MMM DD')
  return x
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address, chars = 4) {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}
// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenStraknetAddress(address, chars = 4) {
  const parsed = isStarknetAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(66 - chars)}`
}

export const toWeeklyDate = (date) => {
  const formatted = dayjs.utc(dayjs.unix(date))
  date = new Date(formatted)
  const day = new Date(formatted).getDay()
  var lessDays = day === 6 ? 0 : day + 1
  var wkStart = new Date(new Date(date).setDate(date.getDate() - lessDays))
  var wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6))
  return dayjs.utc(wkStart).format('MMM DD') + ' - ' + dayjs.utc(wkEnd).format('MMM DD')
}

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

export async function splitQuery(query, localClient, vars, list, skipCount = 100) {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    let sliced = list.slice(skip, end)
    let result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first',
    })
    fetchedData = {
      ...fetchedData,
      ...result.data,
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

export const convertDateToUnixFormat = (date) => {
  if (!Number.isNaN(Number(date))) {
    return date
  }
  return Math.floor(new Date(date).getTime() / 1000)
}

export const toNiceDateYear = (date) => dayjs.utc(dayjs.unix(date)).format('MMMM DD, YYYY')

export const isAddress = (value) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase())
  } catch {
    return false
  }
}

export const isStarknetAddress = (value, validateLength = false) => {
  if (!value) {
    return false
  }
  try {
    const processedValue = value?.toLowerCase()
    if (!processedValue.startsWith('0x')) {
      return false
    }
    if (validateLength && processedValue.length !== zeroStarknetAddress.length) {
      return false
    }
    return validateAndParseAddress(processedValue)
  } catch {
    return false
  }
}

export const convertHexToDecimal = (address = '') => {
  if (!isStarknetAddress(address)) {
    return ''
  }
  return starknetNumberModule.hexToDecimalString(address)
}

export const toK = (num, maxSigns = 2) => {
  return Numeral(num).format(
    `0.[${Array.from({ length: maxSigns })
      .map(() => 0)
      .join('')}]a`
  )
}

export const urls = {
  showTransaction: (tx) => `https://starkscan.co/tx/${tx}/`,
  showAddress: (address) => `https://starkscan.co/contract/${address}/`,
  showToken: (address) => `https://starkscan.co/contract/${address}/`,
  showBlock: (block) => `https://starkscan.co/block/${block}/`,
}

export const formatTime = (unix) => {
  const now = dayjs()
  const timestamp = dayjs.unix(unix)

  const inSeconds = now.diff(timestamp, 'second')
  const inMinutes = now.diff(timestamp, 'minute')
  const inHours = now.diff(timestamp, 'hour')
  const inDays = now.diff(timestamp, 'day')

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? 'day' : 'days'} ago`
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? 'hour' : 'hours'} ago`
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else {
    return `${inSeconds} ${inSeconds === 1 ? 'second' : 'seconds'} ago`
  }
}

export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat([], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  return formatter.format(num)
}

export const toSignificant = (number, significantDigits) => {
  Decimal.set({ precision: significantDigits + 1, rounding: Decimal.ROUND_UP })
  const updated = new Decimal(number).toSignificantDigits(significantDigits)
  return updated.toFormat(updated.decimalPlaces(), { groupSeparator: '' })
}

export const formattedNum = (number, usd = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0
  }
  let num = parseFloat(number)

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true)
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return 0
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd ? formatDollarAmount(num, 0) : Number(parseFloat(num).toFixed(0)).toLocaleString()
  }

  if (usd) {
    if (num < 1) {
      return formatDollarAmount(num, 4)
    } else {
      return formatDollarAmount(num, 2)
    }
  }

  return Number(parseFloat(num).toFixed(4)).toString()
}

export function rawPercent(percentRaw) {
  let percent = parseFloat(percentRaw * 100)
  if (!percent || percent === 0) {
    return '0%'
  }
  if (percent < 1 && percent > 0) {
    return '< 1%'
  }
  return percent.toFixed(0) + '%'
}

export function formattedPercent(percent, useAbs = false) {
  const green = '#21E70F'
  const red = '#FC4D4D'
  percent = parseFloat(percent)
  if (!percent || percent === 0) {
    return <Text fontWeight={500}>0%</Text>
  }

  if (percent < 0.0001 && percent > 0) {
    return (
      <Text fontWeight={500} color={green}>
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent < 0 && percent > -0.0001) {
    return (
      <Text fontWeight={500} color={red}>
        {'< 0.0001%'}
      </Text>
    )
  }

  if (percent > 999999) {
    return (
      <Text fontWeight={500} color={green}>
        {'> 999999%'}
      </Text>
    )
  }

  let fixedPercent = percent.toFixed(2)
  if (fixedPercent === '0.00') {
    return '0%'
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return <Text fontWeight={500} color={green}>{`${useAbs ? '' : '+'}${percent?.toFixed(0).toLocaleString()}%`}</Text>
    } else {
      return <Text fontWeight={500} color={green}>{`${useAbs ? '' : '+'}${fixedPercent}%`}</Text>
    }
  } else {
    return <Text fontWeight={500} color={red}>{`${fixedPercent}%`}</Text>
  }
}

export const get2DayPercentChange = (oneDayData, twoDaysData) => {
  // get volume info for both 24 hour periods
  let yesterdayData = twoDaysData - oneDayData

  const adjustedPercentChange = (parseFloat(oneDayData - yesterdayData) / parseFloat(yesterdayData)) * 100

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange = ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0
  }
  return adjustedPercentChange
}

export function isEquivalent(a, b) {
  var aProps = Object.getOwnPropertyNames(a)
  var bProps = Object.getOwnPropertyNames(b)
  if (aProps.length !== bProps.length) {
    return false
  }
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i]
    if (a[propName] !== b[propName]) {
      return false
    }
  }
  return true
}

export default function findClosestPrice(data) {
  const keys = ['one_day', 'two_days', 'one_week', 'one_month']
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (data[key] && data[key].close) {
      return data[key].close
    }
  }

  return null // Close price not found
}