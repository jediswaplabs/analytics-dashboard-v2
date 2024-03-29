import React from 'react'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'

export default function DoubleTokenLogo({ a0, a1, s0, s1, size = 24, margin = false }) {
  const TokenWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
  `

  const HigherLogo = styled(TokenLogo)`
    z-index: 2;
    border-radius: 50%;
  `

  const CoveredLogo = styled(TokenLogo)`
    margin-left: -${({ sizeraw }) => (sizeraw / 2).toString() + 'px'};
    border-radius: 50%;
  `

  return (
    <TokenWrapper sizeraw={size} margin={margin}>
      <HigherLogo address={a0} symbol={s0} size={size} sizeraw={size} />
      <CoveredLogo address={a1} symbol={s1} size={size} sizeraw={size} />
    </TokenWrapper>
  )
}
