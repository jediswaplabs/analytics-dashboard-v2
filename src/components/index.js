import React from 'react'
import styled from 'styled-components'
import { Text, Box } from 'rebass'

import Link from './Link'

import { urls } from '../utils'

const Divider = styled(Box)`
  height: 1px;
  background-color: ${({ theme }) => theme.divider};
`

export const BlockedWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const BlockedMessageWrapper = styled.div`
  border: 1px solid #ff3257;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  max-width: 80%;
`

export const IconWrapper = styled.div`
  position: absolute;
  right: 0;
  border-radius: 3px;
  height: 16px;
  width: 16px;
  padding: 0px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text1};

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const Hint = ({ children, ...rest }) => (
  <Text fontSize={16} weight={500} {...rest}>
    {children}
  </Text>
)

const Address = ({ address, token, ...rest }) => (
  <Link color="button" href={token ? urls.showToken(address) : urls.showAddress(address)} external style={{ wordBreak: 'break-all' }} {...rest}>
    {address}
  </Link>
)

export const Hover = styled.div`
  :hover {
    cursor: pointer;
    opacity: ${({ fade }) => fade && '0.7'};
  }
`

export const StyledIcon = styled.div`
  color: ${({ theme }) => theme.text1};
`

const EmptyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-radius: 20px;
  color: ${({ theme }) => theme.text1};
  height: ${({ height }) => height && height};
`

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 26px 2rem 26px;
  max-width: calc(1440px + 2rem);

  @media screen and (max-width: 1080px) {
    padding-left: 16px;
    padding-right: 16px;
  }
`

export const PageHeader = styled.div`
  margin-bottom: 32px;
  display: flex;
  gap: 32px;
  flex-direction: column;
  width: 100%;

  @media screen and (max-width: 600px) {
    margin-bottom: 16px;
    gap: 16px;
  }
`

export const PageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ContentWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr;
  grid-gap: 32px;
  //max-width: calc(1440px + 2rem);
  //padding-right: 1rem;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
  @media screen and (max-width: 1080px) {
    grid-gap: 16px;
  }
`

export const FullWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr;
  grid-gap: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;

  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

export const FixedMenu = styled.div`
  z-index: 99;
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  box-sizing: border-box;
  margin-bottom: 2rem;
  max-width: 100vw;

  @media screen and (max-width: 800px) {
    margin-bottom: 0;
  }
`

export { Hint, Divider, Address, EmptyCard }
