import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { isEmpty } from 'lodash'
import { isStarknetAddress } from '../../utils'
import { useWhitelistedTokens } from '../../contexts/Application'

const BAD_IMAGES = {}

const Inline = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

const Image = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

export default function TokenLogo({ address, symbol, header = false, size = 24, margin = false, ...rest }) {
  const [error, setError] = useState(false)
  const whitelistedTokens = useWhitelistedTokens()
  const sizeInPx = size + 'px'

  useEffect(() => {
    setError(false)
  }, [address])

  if (error || BAD_IMAGES[address] || !isStarknetAddress(address) || isEmpty(whitelistedTokens)) {
    return (
      <Inline margin={margin} sizeraw={size}>
        <span {...rest} alt={''} style={{ fontSize: sizeInPx }} role="img" aria-label="face">
          🤔
        </span>
      </Inline>
    )
  }

  const path = whitelistedTokens[address]
    ? whitelistedTokens[address].logoURI
    : `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

  return (
    <Inline margin={margin} sizeraw={size}>
      <Image
        {...rest}
        alt={''}
        src={path}
        size={sizeInPx}
        onError={(event) => {
          BAD_IMAGES[address] = true
          setError(true)
          event.preventDefault()
        }}
      />
    </Inline>
  )
}
